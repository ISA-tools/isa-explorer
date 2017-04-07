import 'ignore-styles';
import test from 'tape';
import sinon from 'sinon';
// import '../../setup';
import React from 'react';

import { shallow } from 'enzyme';

import studies from '../../../fixtures/isatab-index.json';
import Study, { SidebarHeader, LinkPanel, AssaysView, DesignsView } from '../../../../js/components/views/study';
import * as constants from '../../../../js/utils/constants';

/**
 * @description SidebarHeader
 */
test('<SidebarHeader />', assert => {
    const study = studies[0], wrapper = shallow(<SidebarHeader study={study} />);
    const children = wrapper.children();
    assert.equal(children.length, 5, 'The header is composed of 5 nodes');
    children.forEach(child => {
        assert.ok(child.is('span'), 'All the header nodes are HTML spans');
    });
    assert.end();
});

/**
 * @method
 * @name prepareData
 * @param{Integer} len
 * @return{Array} data
 */
const prepareData = len => {
    const data = [];
    for (let i = 0; i < len; i++) {
        const item  = {};
        item[constants.DATA_RECORD_URI] = `http://something.else/${i}`;
        item[constants.DATA_REPOSITORY] = `Repo_${i}`;
        item[constants.DATA_RECORD_ACCESSION] = `Accession-${i}`;
        data.push(item);
    }
    return data;
};

/**
 * @method
 * @name prepareAssays
 * @param{Integer} len
 * @return{Array} data
 */
const prepareAssays = len => {
    const assays = [];
    for (let i = 0; i < len; i++) {
        const item  = {};
        item[constants.STUDY_ASSAY_FILE_NAME] = `assayFile-${i}.txt`;
        item[constants.STUDY_ASSAY_MEASUREMENT_TYPE] = `MeasurementType_${i}`;
        item[constants.STUDY_ASSAY_TECHNOLOGY_TYPE] = `TechnologyType-${i}`;
        assays.push(item);
    }
    return assays;
};

test('<LinkPanel />', assert => {
    const len = 9, data = prepareData(len);
    const wrapper = shallow(<LinkPanel data={data} />);
    assert.equal(wrapper.find('li').length, len, `${len} list items have been instantiated`);
    wrapper.find('li').forEach(li => {
        assert.ok(li.find('a').exists(), 'Each list element contains an archor tag');
    });
    assert.end();
});

test('<Study.Sidebar />', assert => {
    const investigation = {
        studies: [{}]
    };
    investigation.studies[0][constants.DATA_RECORDS] = ['bao', 'miao'];
    const wrapper = shallow(<Study.Sidebar investigation={investigation} />);
    assert.ok(wrapper.hasClass('sidebar'), 'The root element has a class .sidebar');
    const header = wrapper.find(SidebarHeader), linkPanel = wrapper.find(LinkPanel);
    assert.equal(header.length, 1, '<Study.Sidebar> contains a <SidebarHeader>');
    assert.deepEqual(header.prop('study'), investigation.studies[0], 'The <SidebarHeader> shows the first study');
    assert.equal(linkPanel.length, 1, '<Study.Sidebar> contains a <LinkPanel>');
    assert.deepEqual(linkPanel.prop('data'), investigation.studies[0][constants.DATA_RECORDS], 'The <LinkPanel> shows the data records of the first study');
    assert.end();
});

test('<AssaysView />', assert => {
    const len = 9, assays = prepareAssays(len),
        wrapper = shallow(<AssaysView assays={assays} dirName='sdata0000' />);
    assert.equal(wrapper.find('li').length, len, `${len} list items have been instantiated`);
    let i = 0;
    wrapper.find('li').forEach(li => {
        const text = `${assays[i][constants.STUDY_ASSAY_MEASUREMENT_TYPE]} measured by ${assays[i][constants.STUDY_ASSAY_TECHNOLOGY_TYPE]}`;
        assert.equal(li.key(), assays[i][constants.STUDY_ASSAY_FILE_NAME]);
        assert.ok(li.text().includes(text), `The text ${li.text()} has been set correctly, containing ${text}`);
        i++;
    });
    assert.end();
});

/**
 * @method
 * @name prepareDesigns
 * @param{Integer} len
 * @param{Boolean} hasTerm
 * @return{Array} data
 */
const prepareDesigns = (len, hasTerm = true) => {
    const designs = [];
    for (let i = 0; i < len; i++) {
        const item  = {};
        item[constants.STUDY_DESIGN_TYPE] = `designType_${i}`;
        if (hasTerm) {
            item[constants.STUDY_DESIGN_TYPE_TERM_ACCESSION_NUMBER] = `termAccessionNumber_${i}`;
            item[constants.STUDY_DESIGN_TYPE_TERM_SOURCE_REF] = `termSourceRef_${i}`;
        }
        designs.push(item);
    }
    return designs;
};

test('<DesignsView /> with term accession number', assert => {
    const len = 9, designs = prepareDesigns(len),
        wrapper = shallow(<DesignsView designs={designs} />);
    assert.equal(wrapper.find('li').length, len, `${len} list items have been instantiated`);
    let i = 0;
    wrapper.find('li').forEach(li => {
        assert.equal(li.key(), designs[i][constants.STUDY_DESIGN_TYPE]);
        const p = li.find('p'), span = p.find('span');
        assert.ok(p.exists(), `<li> item #${i} contains a <p> tag`);
        assert.equal(span.text(), designs[i][constants.STUDY_DESIGN_TYPE_TERM_ACCESSION_NUMBER], `The text ${span.text()} has been set correctly for the item #${i}`);
        i++;
    });
    assert.end();
});

test('<DesignsView /> without term accession number', assert => {
    const len = 3, designs = prepareDesigns(len, false),
        wrapper = shallow(<DesignsView designs={designs} />);
    assert.equal(wrapper.find('li').length, len, `${len} list items have been instantiated`);
    let i = 0;
    wrapper.find('li').forEach(li => {
        const p = li.find('p'), span = p.find('span');
        assert.ok(p.exists(), `<li> item #${i} contains a <p> tag`);
        assert.notOk(span.exists(), `<p> item #${i} does not contain a <span> element`);
        i++;
    });
    assert.end();
});

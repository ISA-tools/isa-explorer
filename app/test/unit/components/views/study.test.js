import 'ignore-styles';
import test from 'tape';
import sinon from 'sinon';
// import '../../setup';
import React from 'react';

import { shallow } from 'enzyme';

import studies from '../../../fixtures/isatab-index.json';
import { SidebarHeader, LinkPanel } from '../../../../js/components/views/study';
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

test('<LinkPanel />', assert => {
    const len = 9, data = prepareData(len);
    const wrapper = shallow(<LinkPanel data={data} />);
    assert.equal(wrapper.find('li').length, len, `${len} list items have been instantiated`);
    wrapper.find('li').forEach(li => {
        assert.ok(li.find('a').exists(), 'Each list element contains an archor tag');
    });
    assert.end();
});

test('<Sidebar />', assert => {
    assert.end();
});

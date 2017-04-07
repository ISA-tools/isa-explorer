import 'ignore-styles';
import test from 'tape';
import sinon from 'sinon';

import React from 'react';
import TestUtils, { Simulate } from 'react-addons-test-utils';
import { shallow, mount } from 'enzyme';

import Studies from '../../../../js/components/views/studies';
import { StudiesContainer } from '../../../../js/components/containers/studies-container';
import studies from '../../../fixtures/isatab-index.json';
import * as api from '../../../../js/api';


const studiesContainerSetup = (props, isShallow = true) => {
    const spySAIIF = sinon.spy(), spySNXIIF = sinon.spy(), spyRIIF = sinon.spy(), spyTFI = sinon.spy(),
        spyFIFT = sinon.spy(), spyRFTS = sinon.spy(), stubApi = sinon.stub(api, 'getStudies'),
        studiesContainer = <StudiesContainer {...props} filterItemsFullText={spyFIFT} resetFullTextSearch={spyRFTS}
            showAllItemsInFacet={spySAIIF} resetItemsInFacet={spyRIIF} showNextXItemsInFacet={spySNXIIF} toggleFacetItem={spyTFI}
        />,
        wrapper = isShallow ?  shallow(studiesContainer) : mount(studiesContainer);
    return {
        wrapper,
        spyFIFT,
        spySAIIF,
        spySNXIIF,
        spyRIIF,
        spyRFTS,
        spyTFI,
        stubApi
    };
};

const studiesContainerTeardown = () => {
    api.getStudies.restore();
};

test('<StudiesContainer />', assert => {
    const opts = {
        location: {
            query: {
                queryText: ''
            }
        }
    };
    const { wrapper } = studiesContainerSetup(opts);
    const button = wrapper.find('button');
    // assert.ok(button.is('#menu-toggle'), 'The container has one button to toggle the menu');
    assert.equal(wrapper.find(Studies.Sidebar).length, 1, 'The container contains only one <Studies.Sidebar> subcomponent');
    assert.equal(wrapper.find(Studies.List).length, 1, 'The container contains only one <Studies.List> subcomponent');
    // assert.ok(stubApi.calledOnce, 'The \'getStudies\' method has been invoked on mount.'); //TODO you need a proper mount instance to test this
    assert.end();
    studiesContainerTeardown();
});

test('<StudiesContainer />', assert => {
    const opts = {
        location: {
            query: {
                queryText: ''
            }
        }
    };
    const { wrapper, stubApi } = studiesContainerSetup(opts, false);
    assert.ok(stubApi.calledOnce, 'The \'getStudies\' method has been invoked on mount.');
    wrapper.setProps({
        studies: studies
    });
    assert.end();
    studiesContainerTeardown();
});

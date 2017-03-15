import 'ignore-styles';
import test from 'tape';
import sinon from 'sinon';
import '../../setup';
import React from 'react';
import Highlight from 'react-highlighter';
import TestUtils, { Simulate } from 'react-addons-test-utils';
import { shallow } from 'enzyme';

import { DEFAULT_VISIBLE_ITEMS_PER_FACET, ITEMS_TO_ADD_PER_FACET } from '../../../../js/utils/constants';
import { SearchBox, FacetingFilter, Sidebar, ItemOverview, List } from '../../../../js/components/views/studies';
import studies from '../../../fixtures/isatab-index.json';

const facetArr = [
    ['item1', [1, 2, 3, 12, 15, 17]], ['item2', [2, 4, 8, 16]], ['item3', [0, 1, 5, 17]],
    ['item4', [1, 2, 8]], ['item5', [2, 4, 7]], ['item6', [0, 1, 15]],
    ['item7', [1, 12, 9]], ['item8', [2, 14]], ['item9', [1, 15]],
    ['item10', [8, 13]], ['item11', [12]], ['item12', [15]]
];

/**
 * @description SearchBox
 */

const searchBoxShallowSetup = () => {
    const renderer = TestUtils.createRenderer(),
        spyFIFT = sinon.spy(), spyRFTS = sinon.spy();
    renderer.render(<SearchBox studies={studies} filterItemsFullText={spyFIFT}
        resetFullTextSearch={spyRFTS}  />);
    const result = renderer.getRenderOutput();
    return {
        result,
        renderer,
        spyFIFT,
        spyRFTS
    };
};

const searchBoxDOMSetup = () => {
    const spyFIFT = sinon.spy(), spyRFTS = sinon.spy();
    const result = TestUtils.renderIntoDocument(
        <SearchBox studies={studies} filterItemsFullText={spyFIFT}
            resetFullTextSearch={spyRFTS}  />
    );
    return {
        result,
        spyFIFT,
        spyRFTS
    };
};

test('SearchBox.render()', assert => {
    const { result } = searchBoxShallowSetup();
    assert.equal(result.type, 'div', 'The root node of a SearchBox is a div');
    assert.equal(result.props.children[0].props.placeholder, 'Search', 'The placeholder for input field is "Search"');
    assert.equal(result.props.children[2].props.children.props.id, 'reset-button', 'The search box does contain a reset-button');
    assert.end();
});

test('SearchBox.onSearchBtnClick()', assert => {
    const { result, spyFIFT, spyRFTS } = searchBoxDOMSetup(),
        input = TestUtils.findRenderedDOMComponentWithTag(result, 'input'),
        searchBtn = TestUtils.findRenderedDOMComponentWithClass(result, 'button'),
        text = 'bao';
    // result.input = { value: 'bao' };
    input.value = text;
    Simulate.click(searchBtn);
    assert.ok(spyFIFT.calledOnce, 'The search callback was triggered.');
    assert.ok(spyFIFT.calledWith('bao'),`The search callaback was triggered with query: ${text}`);
    input.value = '';
    Simulate.click(searchBtn);
    assert.ok(spyRFTS.calledOnce);
    assert.end();
});

test('SearchBox.onResetBtnClick()', assert => {
    const { result, spyRFTS } = searchBoxDOMSetup(),
        input = TestUtils.findRenderedDOMComponentWithTag(result, 'input'),
        resetBtn = TestUtils.findRenderedDOMComponentWithTag(result, 'a'),
        text = 'bao';
    assert.equal(resetBtn.id, 'reset-button', 'We are testing the reset function');
    input.value = text;
    Simulate.click(resetBtn);
    assert.ok(spyRFTS.calledOnce, 'The reset callback was invoked');
    assert.notOk(input.value, 'The input value has been reset');
    assert.end();
});


/**
 * @description FacetingFilter
 */
const facetingFilterShallowSetup = props => {
    const renderer = TestUtils.createRenderer(), spyRIIF = sinon.spy(), spySAIIF = sinon.spy(), spySNXIIF = sinon.spy();
    renderer.render(<FacetingFilter showAllItemsInFacet={spySAIIF} resetItemsInFacet={spyRIIF}
        showNextXItemsInFacet={spySNXIIF} {...props}  />);
    return {
        result: renderer.getRenderOutput(),
        spyRIIF,
        spySAIIF,
        spySNXIIF
    };
};

const facetingFilterDOMSetup = props => {
    const spyRIIF = sinon.spy(), spySAIIF = sinon.spy(), spySNXIIF = sinon.spy();
    const result = TestUtils.renderIntoDocument(<FacetingFilter showAllItemsInFacet={spySAIIF} resetItemsInFacet={spyRIIF}
        showNextXItemsInFacet={spySNXIIF} {...props}  />);
    return {
        result,
        spyRIIF,
        spySAIIF,
        spySNXIIF
    };
};

test('FacetingFilter.render()', assert => {
    const opts = {
            name: '_factors',
            facetArr: [['item1', [1, 2, 3]], ['item2', [2, 4]], ['item3', [0, 1]] ]
        },
        { result } = facetingFilterShallowSetup(opts);
    assert.equal(result.props.className, 'filter', 'The componanent root has  a filter class');
    const { children } = result.props;
    assert.equal(children.length, 3, 'The componanent has three children nodes');
    assert.equal(children[0].type, 'p', 'The first child is a paragraph');
    assert.equal(children[1].type, 'ul', 'The second child is an ordered list container');
    assert.equal(children[2].type, 'div', 'The third is a standard container');
    const ul = children[1], list = ul.props.children;
    assert.equal(list.length, opts.facetArr.length, `The list must contain ${opts.facetArr.length} items`);
    assert.end();
});

test('FacetingFilter.onShowNextXOnClick()', assert => {
    const opts = {
            name: '_factors',
            facetArr: facetArr
        }, { result, spySNXIIF } = facetingFilterDOMSetup(opts),
        showNextXCtr = TestUtils.findRenderedDOMComponentWithClass(result, 'show-next-5');
        // resetCtr = TestUtils.findRenderedDOMComponentWithClass(result, 'reset');
    assert.equal(TestUtils.scryRenderedDOMComponentsWithClass(result, 'value').length, DEFAULT_VISIBLE_ITEMS_PER_FACET, `At first render() ${DEFAULT_VISIBLE_ITEMS_PER_FACET} items are shown`);
    Simulate.click(showNextXCtr);
    assert.ok(spySNXIIF.withArgs(opts.name).calledOnce, `The \'show next X items\' callback has been invoked with argument ${opts.name}`);
    // assert.equal(TestUtils.scryRenderedDOMComponentsWithClass(result, 'value').length, DEFAULT_VISIBLE_ITEMS_PER_FACET + ITEMS_TO_ADD_PER_FACET, `After the 'Show next' button is clicked, ${DEFAULT_VISIBLE_ITEMS_PER_FACET + ITEMS_TO_ADD_PER_FACET} are shown`);
    assert.end();
});

test('FacetingFilter.onShowAllClick()', assert => {
    const opts = {
            name: '_factors',
            facetArr: facetArr
        }, { result,spySAIIF } = facetingFilterDOMSetup(opts),
        showAllCtr = TestUtils.findRenderedDOMComponentWithClass(result, 'show-all');
    Simulate.click(showAllCtr);
    assert.ok(spySAIIF.withArgs(opts.name).calledOnce, `The \'show all items\' callback has been invoked with argument ${opts.name}`);
    assert.end();
});

test('FacetingFilter.onResetBtnClick()', assert => {
    const opts = {
            name: '_factors',
            facetArr: facetArr,
            visibleItems: 8
        }, { result,spyRIIF } = facetingFilterDOMSetup(opts),
        resetCtr = TestUtils.findRenderedDOMComponentWithClass(result, 'reset');
    assert.equal(TestUtils.scryRenderedDOMComponentsWithClass(result, 'value').length, opts.visibleItems, `The component is rendered with
        ${opts.visibleItems} visible items.`);
    Simulate.click(resetCtr);
    assert.ok(spyRIIF.withArgs(opts.name).calledOnce, `The \'reset items\' callback has been invoked with argument ${opts.name}`);
    assert.end();
});

const sidebarShallowSetup = props => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Sidebar {...props} showAllItemsInFacet={() => {}} showNextXItemsInFacet={() => {}}
        resetItemsInFacet={() => {}} filterItemsFullText={() => {}} resetFullTextSearch={() => {}}
     />);
    return {
        result: renderer.getRenderOutput(),
        wrapper: shallow(<Sidebar {...props} showAllItemsInFacet={() => {}} showNextXItemsInFacet={() => {}}
            resetItemsInFacet={() => {}} filterItemsFullText={() => {}} resetFullTextSearch={() => {}}
         />)
    };
};

test('Sidebar.render()', assert => {
    const { result, wrapper } = sidebarShallowSetup();
    assert.equal(result.type, 'div', 'The component root node is a DIV');
    assert.equal(result.props.id, 'sidebar', 'The component root node has ID = \'sidebar\'');
    assert.equal(result.props.children.length, 7, 'The component root node has 7 children nodes');
    // assert.deepEqual(result.props.children[2].type.toString(), '[Function: SearchBox]', ' A <SearchBox> component has been instantiated as third child node');
    assert.deepEqual(result.props.children[4].props.children, [], 'No faceting filter is instatiated since the element is empty');
    assert.equal(wrapper.find(SearchBox).length, 1, 'The component should contain only one "SearchBox" item');
    assert.end();
});

const itemOverviewSetup = props => {
    const spyOC = sinon.spy();
    return {
        wrapper: shallow(<ItemOverview {...props} onClick={spyOC}  />),
        spyOC
    };
};

test('ItemOverview', assert => {
    const { wrapper, spyOC } = itemOverviewSetup();
    assert.equal(wrapper.find('.search-item-block').length, 1, 'One search item boxes should be instantiated');
    assert.equal(wrapper.find('.keywords').exists(), false, 'No keyword <ul> is instantiated');
    assert.end();
});

test('ItemOverview', assert => {
    const study = studies[0], queryText = '', { wrapper, spyOC } = itemOverviewSetup({
            study: study,
            queryText: queryText
        });
    assert.equal(wrapper.find('.keywords').children('li').length, study.keywords.split(';').length,
        'There are as many keywords "li" items as there are keyword in the study');
    const titleHighlight = wrapper.find('.title').children(Highlight);
    assert.ok(titleHighlight.contains(study.title), `The study title is correctly displayed as ${study.title}`);
    assert.equal(titleHighlight.props()['search'], queryText, `The title is highlighting the term \'${queryText}\'`);
    assert.equal(wrapper.state('focus'), false, 'Focus is set to false on component instantiation');
    wrapper.simulate('mouseenter');
    assert.equal(wrapper.state('focus'), true, 'Focus is set to true on mouseenter');
    wrapper.simulate('mouseleave');
    assert.equal(wrapper.state('focus'), false, 'Focus is set to false on mouseleave');
    wrapper.simulate('click');
    assert.ok(spyOC.calledOnce, 'The onClick() handler has been correctly invoked');
    assert.end();
});

test('List', assert => {
    const wrapper = shallow(<List studies={studies} queryText='' />);
    assert.ok(wrapper.find('#article-count').contains(`${studies.length}`), 'The #article-count <span> displays the correct number of studies');
    assert.ok(wrapper.find('header').contains('Data Descriptor Articles Displayed'), 'Default message is displayed if queryText is empty');
    assert.end();
});

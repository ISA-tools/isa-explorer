import 'ignore-styles';
import test from 'tape';
import sinon from 'sinon';
import '../../setup';
import React from 'react';
import TestUtils, { Simulate } from 'react-addons-test-utils';
import { SearchBox } from '../../../../js/components/views/studies';
import studies from '../../../fixtures/isatab-index.json';

const searchBoxShallowSetup = () => {
    const renderer = TestUtils.createRenderer(),
        filterItemsFullText = () => {}, resetFullTextSearch = () => {};
    renderer.render(<SearchBox studies={studies} filterItemsFullText={filterItemsFullText}
        resetFullTextSearch={resetFullTextSearch}  />);
    const result = renderer.getRenderOutput();
    return {
        result,
        renderer,
        filterItemsFullText,
        resetFullTextSearch
    };
};

const searchBoxDOMSetup = () => {
    const filterItemsFullText = () => {}, resetFullTextSearch = () => {},
        spyFIFT = sinon.spy(filterItemsFullText), spyRFTS = sinon.spy(resetFullTextSearch);
    const result = TestUtils.renderIntoDocument(
        <SearchBox studies={studies} filterItemsFullText={filterItemsFullText}
            resetFullTextSearch={resetFullTextSearch}  />
    );
    return {
        result,
        filterItemsFullText,
        resetFullTextSearch,
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

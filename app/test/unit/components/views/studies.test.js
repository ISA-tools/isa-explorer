import 'ignore-styles';
import test from 'tape';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { SearchBox } from '../../../../js/components/views/studies';
import studies from '../../../fixtures/isatab-index.json';


test('SearchBox', assert => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<SearchBox studies={studies} filterItemsFullText={() => {}} resetFullTextSearch={() => {}}  />);
    const result = renderer.getRenderOutput();
    assert.equal(result.type, 'div', 'The root node of a SearchBox is a div');
    assert.equal(result.props.children[0].props.placeholder, 'Search', 'The placeholder for input field is "Search"');
    assert.end();
});

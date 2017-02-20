import test from 'tape';
import * as types from '../../../js/actions/action-types';
import studiesReducer, { computeFacets, formatStudies, initialState } from '../../../js/reducers/studies-reducer';
import { DEFAULT_VISIBLE_ITEMS_PER_FACET, ITEMS_TO_ADD_PER_FACET } from '../../../js/utils/constants';
import config from '../../../js/config/base';
import studies from '../../fixtures/isatab-index.json';

test('formatStudies', assert => {

    const formattedStudies = formatStudies(studies);
    assert.equal(formattedStudies.length, studies.length, 'The input and output arrays have the same length');
    for (const study of formattedStudies) {
        for (const facet of config.facets) {
            assert.ok(study.hasOwnProperty(facet.name), `Item ${study.id} should have property ${facet.name}`);
        }
    }
    assert.end();

});

test('computeFacets', assert => {
    //TODO
    assert.end();
});

test('studiesReducer', assert => {
    let expectedState, facet, facetItem, studiesTaggedWithItem;
    assert.deepEqual(studiesReducer(), initialState, 'The studiesReducer retuns initial state if no arguments are provided.');

    // SEND_REMOTE_REQUEST
    expectedState = studiesReducer(initialState, { type: types.SEND_REMOTE_REQUEST });
    assert.equal(expectedState.isFetching, true, `When action ${types.SEND_REMOTE_REQUEST} is sent isFetching must be set to true.`);

    // GET_STUDIES_SUCCESS
    expectedState = studiesReducer(initialState, {
        type: types.GET_STUDIES_SUCCESS,
        studies
    });
    assert.equal(expectedState.studies.length, studies.length, `The state has now ${expectedState.studies.length} studies`);
    assert.notOk(expectedState.isFetching, 'Studies have been fetched so state.isFetching is now set to false.');
    assert.equal(expectedState.activeStudies.length, studies.length, 'All studies are active');
    assert.equal(expectedState.visibleStudies.length, studies.length, 'All studies are visible');
    for (const prop of Object.keys(expectedState.visibleItemsPerFacet)) {
        assert.equal(expectedState.visibleItemsPerFacet[prop], DEFAULT_VISIBLE_ITEMS_PER_FACET, `Facet ${prop} has ${DEFAULT_VISIBLE_ITEMS_PER_FACET} items.`);
        assert.deepEqual(expectedState.filteredFacetItems[prop], [], `Facet ${prop} has no items filtered out.`);
    }

    // SHOW_NEXT_X_ITEMS_IN_FACET
    facet = config.facets[0].name;
    expectedState = studiesReducer(expectedState, {
        type: types.SHOW_NEXT_X_ITEMS_IN_FACET,
        facetName: facet
    });
    const nextVisibleItems = DEFAULT_VISIBLE_ITEMS_PER_FACET + ITEMS_TO_ADD_PER_FACET;
    assert.equal(expectedState.visibleItemsPerFacet[facet], nextVisibleItems, `Facet ${facet} has ${nextVisibleItems} visible items.`);

    // SHOW_ALL_ITEMS_IN_FACET
    expectedState = studiesReducer(expectedState, {
        type: types.SHOW_ALL_ITEMS_IN_FACET,
        facetName: facet
    });
    assert.equal(expectedState.visibleItemsPerFacet[facet], Infinity, `All items are visible for facet ${facet}`);

    // RESET_ITEMS_IN_FACET
    expectedState = studiesReducer(expectedState, {
        type: types.RESET_ITEMS_IN_FACET,
        facetName: facet
    });
    assert.equal(expectedState.visibleItemsPerFacet[facet], DEFAULT_VISIBLE_ITEMS_PER_FACET, `Visible items have been reset to
        ${DEFAULT_VISIBLE_ITEMS_PER_FACET} for facet ${facet}`);

    // TOGGLE_FACET_ITEM
    facetItem = expectedState.facets[facet][0][0]; // take the first item from the facet array
    studiesTaggedWithItem = expectedState.facets[facet][0][1];
    expectedState = studiesReducer(expectedState, {
        type: types.TOGGLE_FACET_ITEM,
        facetName: facet,
        facetItem
    });
    assert.deepEqual(expectedState.visibleStudies, studiesTaggedWithItem, 'Only the studies having the selected tag are visible');
    assert.deepEqual(expectedState.filteredFacetItems[facet], [facetItem], `The filteredFacetItems object for key ${facet} contains only item ${facetItem}`);

    expectedState = studiesReducer(expectedState, {
        type: types.TOGGLE_FACET_ITEM,
        facetName: facet,
        facetItem
    });
    assert.deepEqual(expectedState.visibleStudies, studies.map(el => el.id), 'all the studies are now visible again');
    assert.deepEqual(expectedState.filteredFacetItems[facet], [], `The filteredFacetItems object for key ${facet} is an empty array`);

    // UPDATE_ACTIVE_STUDIES
    expectedState = studiesReducer(expectedState, {
        type: types.UPDATE_ACTIVE_STUDIES,
        queryText: 'phen',
        activeStudies: [{ref: 2}, {ref: 10}, {ref: 16}, {ref: 18}]
    });
    assert.equal(expectedState.queryText, 'phen', 'The query text is correctly set for UPDATE_ACTIVE_STUDIES action');
    assert.deepEqual(expectedState.activeStudies, [2, 10, 16, 18], 'The active studies are correctly set for UPDATE_ACTIVE_STUDIES action');

    // RESET_ACTIVE_STUDIES
    expectedState = studiesReducer(expectedState, {
        type: types.RESET_ACTIVE_STUDIES
    });
    assert.equal(expectedState.queryText, '', 'The query text is reset to empty string');
    assert.deepEqual(expectedState.activeStudies, studies.map(el => el.id), 'All studies are active again');

    assert.end();
});

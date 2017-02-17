import test from 'tape';
import * as types from '../../../js/actions/action-types';
import studiesReducer, { computeFacets, formatStudies, initialState } from '../../../js/reducers/studies-reducer';
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

test('studiesReducer', assert => {
    assert.deepEqual(studiesReducer(), initialState, 'The studiesReducer retuns initial state if no arguments are provided');
    assert.deepEqual)
    assert.end();
});

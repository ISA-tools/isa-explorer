import * as types from '../actions/action-types';
import { toPairs, flatMap, countBy } from 'lodash';
import { DEFAULT_VISIBLE_ITEMS_PER_FACET } from '../utils/constants';

const initialState = {
    studies: [],
    facets: {},
    visibleItemsPerFacet: {},
    isFetching: false
};

/**
 * @method
 * @name formatStudies
 * @description splits the text lists into arrays (preserving also the original lists)
 */
function formatStudies(studies) {

    const separator = ';';

    for (const study of studies) {
        study._assays = study.assays.split(separator);
        study._repositories = study.repository.split(separator);
        study._designs = study.designs.split(separator);
        study._technologies = study.technologies.split(separator);
        study._factors = study.factors.split(separator);

        study._organisms = study.hasOwnProperty('Characteristics[organism]') ? study['Characteristics[organism]'].split(separator) : [];
        study._environments = study.hasOwnProperty('Characteristics[environment type]') ? study['Characteristics[environment type]'].split(separator) : [];
        study._locations = study.hasOwnProperty('Characteristics[geographical location]') ? study['Characteristics[geographical location]'].split(separator) : [];

    }

    return studies;

}

/**
 * @method
 * @name computeFacets
 * @description return the facets from the stdy array
 */
function computeFacets(studies) {
    const facetKeys = ['_assays', '_repositories', '_designs', '_technologies', '_factors', '_organism', '_locations', '_environments'];
    const facets = {};
    for (const key of facetKeys) {
        const flattened = flatMap(studies, study => study[key]);
        facets[key] = toPairs(countBy(flattened)).sort((a, b) => b[1] - a[1]);
    }
    return facets;
}

/**
 * @method
 * @name studyReducer
 */
const studyReducer = function(state = initialState, action) {

    switch (action.type) {

        case types.SEND_REMOTE_REQUEST: {
            return {
                ...state,
                isFetching: true
            };
        }

        case types.GET_STUDIES_SUCCESS: {
            const formattedStudies = formatStudies(action.studies),
                facets = computeFacets(formattedStudies),
                visibleItemsPerFacet = {};
            Object.keys(facets).forEach(key => {
                visibleItemsPerFacet[key] = DEFAULT_VISIBLE_ITEMS_PER_FACET;
            });
            return {
                ...state,
                isFetching: false,
                studies: formattedStudies,
                facets: facets,
                visibleItemsPerFacet: visibleItemsPerFacet
            };
        }

        case types.SHOW_NEXT_X_ITEMS_IN_FACET: {
            const newVisibleItemsObj = {};
            newVisibleItemsObj[action.facetName] = state.visibleItemsPerFacet[action.facetName] + DEFAULT_VISIBLE_ITEMS_PER_FACET;
            return {
                ...state,
                visibleItemsPerFacet: {
                    ...state.visibleItemsPerFacet,
                    ...newVisibleItemsObj
                }
            };
        }

        case types.SHOW_ALL_ITEMS_IN_FACET: {
            const newVisibleItemsObj = {};
            newVisibleItemsObj[action.facetName] = Infinity;
            return {
                ...state,
                visibleItemsPerFacet: {
                    ...state.visibleItemsPerFacet,
                    ...newVisibleItemsObj
                }
            };
        }

        case types.RESET_ITEMS_IN_FACET: {
            const newVisibleItemsObj = {};
            newVisibleItemsObj[action.facetName] = DEFAULT_VISIBLE_ITEMS_PER_FACET;
            return {
                ...state,
                visibleItemsPerFacet: {
                    ...state.visibleItemsPerFacet,
                    ...newVisibleItemsObj
                }
            };
        }

    }

    return state;

};

export default studyReducer;

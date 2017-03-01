import * as types from '../actions/action-types';
import { toPairs, intersection, intersectionBy, xor, find, uniq } from 'lodash';
import { DEFAULT_VISIBLE_ITEMS_PER_FACET, ITEMS_TO_ADD_PER_FACET } from '../utils/constants';
// import lunr from 'lunr';
import config from '../config/base';

export const initialState = {
    studies: [], // all the studies (i.e. all those retrieved from the server)
    queryText: '',
    activeStudies: [], //array of studies currently active (as filtered out by FTS)
    visibleStudies: [], // array containing the ids of the visible studies on facets
    // index: new lunr(() => {}), // the full-text search index TODO modify this must be Immutable
    facets: {},
    visibleItemsPerFacet: {},
    filteredFacetItems: {},
    isFetching: false
};

/**
 * @method
 * @name formatStudies
 * @description splits the text lists into arrays (preserving also the original lists)
 * @param{Array} studies
 */
export function formatStudies(studies) {

    const separator = ';';

    for (const study of studies) {
        study._assays = uniq(study.assays.split(separator));
        study._repositories = uniq(study.repository.split(separator));
        study._designs = uniq(study.designs.split(separator));
        study._technologies = uniq(study.technologies.split(separator));
        study._factors = uniq(study.factors.split(separator));

        study._organisms = study.hasOwnProperty('Characteristics[organism]') ? uniq(study['Characteristics[organism]'].split(separator)) : [];
        study._environments = study.hasOwnProperty('Characteristics[environment type]') ? uniq(study['Characteristics[environment type]'].split(separator)) : [];
        study._locations = study.hasOwnProperty('Characteristics[geographical location]') ? uniq(study['Characteristics[geographical location]'].split(separator)) : [];

    }

    return studies;

}

/**
 * @method
 * @name computeFacets
 * @description return the facets from the stdy array
 */
export function computeFacets(studies) {
    const facetKeys = config.facets.map(facet => facet.name); // ['_assays', '_repositories', '_designs', '_technologies', '_factors', '_organisms', '_locations', '_environments'];
    const facets = {};

    for (const key of facetKeys) {
        const facetObj = {};
        for (const study of studies) {
            if (study.hasOwnProperty(key)) {
                for (const item of study[key]) {
                    if (!item) continue;
                    if (facetObj.hasOwnProperty(item)) {
                        facetObj[item].push(study.id);
                        /*
                        console.log(`Pushing study ID ${study.id} into item ${item} for key ${key}`);
                        if (facetObj[item].indexOf(study.id) > -1)
                            console.log(`Oww shucks!! The frigging study ID ${study.id} is already into item ${item}!! WTF??`);
                        */
                    }
                    else {
                        facetObj[item] = [study.id];
                        // console.log(`Pushing study ID ${study.id} into item ${item} for key ${key}. Array newly created`);
                    }
                }
            }
        }
        // console.log(facetObj);
        facets[key] = toPairs(facetObj).sort((a, b) => b[1].length - a[1].length);
    }
    return facets;
}

/**
 * @method
 * @name computeVisibleStudies
 * @param{Array} studies
 * @param{Array} facets
 * @param {Object} filteredFacetItemsObj
 * @return Array
 * @description given a list of studies it filters them on the basis of the filtered facets as specified in filteredFacetItemsObj
 */
export function computeVisibleStudies(studies, facets, filteredFacetItemsObj) {
    let visibleStudies = studies.map(study => study.id);
    for (const facetName of Object.keys(filteredFacetItemsObj)) {
        for (const item of filteredFacetItemsObj[facetName]) {
            const listToIntersect = find(facets[facetName], el => el[0] === item);
            visibleStudies = intersection(visibleStudies, listToIntersect[1]);
        }
    }
    return visibleStudies;
}

/**
 * @method
 * @name studyReducer
 */
const studiesReducer = function(state = initialState, action = {}) {

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
                visibleItemsPerFacet = {},
                { filteredFacetItems = {}, queryText = '' } = action.params; // index = initialiseIndex(formattedStudies);
            Object.keys(facets).forEach(key => {
                visibleItemsPerFacet[key] = DEFAULT_VISIBLE_ITEMS_PER_FACET;
                if (!filteredFacetItems[key]) {
                    filteredFacetItems[key] = [];
                }
            });
            return {
                ...state,
                isFetching: false,
                studies: formattedStudies,
                queryText: '',
                visibleStudies: computeVisibleStudies(formattedStudies, facets, filteredFacetItems),
                activeStudies: formattedStudies.map(study => study.id),
                facets: facets,
                visibleItemsPerFacet: visibleItemsPerFacet,
                filteredFacetItems: filteredFacetItems
            };
        }

        case types.SHOW_NEXT_X_ITEMS_IN_FACET: {
            const newVisibleItemsObj = {};
            newVisibleItemsObj[action.facetName] = state.visibleItemsPerFacet[action.facetName] + ITEMS_TO_ADD_PER_FACET;
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

        case types.TOGGLE_FACET_ITEM: {
            const newFilteredFacetItemsObj = Object.assign({}, state.filteredFacetItems);
            // let newVisibleStudies = state.studies.map(study => study.id);
            newFilteredFacetItemsObj[action.facetName] = xor(state.filteredFacetItems[action.facetName], [action.facetItem]);
            /*
            for (const facetName of Object.keys(newFilteredFacetItemsObj)) {
                for (const item of newFilteredFacetItemsObj[facetName]) {
                    const listToIntersect = find(state.facets[facetName], el => el[0] === item);
                    newVisibleStudies = intersection(newVisibleStudies, listToIntersect[1]);
                }
            } */
            const newVisibleStudies = computeVisibleStudies(state.studies, state.facets, newFilteredFacetItemsObj);
            return {
                ...state,
                filteredFacetItems: newFilteredFacetItemsObj,
                visibleStudies: newVisibleStudies
            };
        }

        case types.UPDATE_ACTIVE_STUDIES: {
            const activeStudies = action.activeStudies.map(elem => { return { id: elem.ref }; }),
                facets = computeFacets(intersectionBy(state.studies, activeStudies, 'id'));

            return {
                ...state,
                queryText: action.queryText,
                activeStudies: activeStudies.map(el => el.id),
                facets: facets
            };
        }

        case types.RESET_ACTIVE_STUDIES: {
            return {
                ...state,
                queryText: '',
                activeStudies: state.studies.map(study => study.id),
                facets: computeFacets(state.studies)
            };
        }

    }

    return state;

};

export default studiesReducer;

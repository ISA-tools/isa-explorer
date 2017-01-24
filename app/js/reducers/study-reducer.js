import * as types from '../actions/action-types';
import { flatMap, countBy } from 'lodash';

const initialState = {
    studies: [],
    facets: {},
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
         facets[key] = countBy(flattened);
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
            const formattedStudies = formatStudies(action.studies);
            return {
                ...state,
                studies: formattedStudies,
                facets: computeFacets(formattedStudies)
            };
        }

    }

    return state;

};

export default studyReducer;

/**
 * @author Massimiliano Izzo
 */

import * as types from '../actions/action-types';

const initialState = {
    isFetching: false,
    investigation: {},
    jsonld: {}
};

const studyReducer = function(state = initialState, action) {

    switch (action.type) {

        case types.SEND_REMOTE_REQUEST: {
            return {
                ...state,
                isFetching: true,
                investigation: {}
            };
        }

        case types.GET_INVESTIGATION_SUCCESS: {
            return {
                ...state,
                isFetching: false,
                investigation: action.investigation,
                jsonld: action.jsonld
            };
        }

    }

    return state;

};

export default studyReducer;

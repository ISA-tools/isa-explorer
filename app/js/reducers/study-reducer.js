/**
 * @author Massimiliano Izzo
 */

import * as types from '../actions/action-types';

const initialState = {
    isFetching: false,
    investigation: {},
    jsonld: {},
    error: null
};

const studyReducer = function(state = initialState, action) {

    switch (action.type) {

        case types.SEND_REMOTE_REQUEST: {
            return {
                ...state,
                isFetching: true,
                error: null,
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

        case types.GET_REMOTE_ERROR: {
            const { message, stack } = action.error;
            return {
                ...state,
                isFetching: false,
                error: {
                    message,
                    stack
                }
            };
        }

    }

    return state;

};

export default studyReducer;

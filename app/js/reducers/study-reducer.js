/**
 * @author Massimiliano Izzo
 */
 
import * as types from '../actions/action-types';

const initialState = {
    isFetching: false,
    investigation: {}
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

        case types.GET_INVESTIGATION_FILE_SUCCESS: {
            return {
                ...state,
                isFetching: false,
                investigation: action.investigation
            };
        }

    }

    return state;

};

export default studyReducer;

import * as types from '../actions/action-types';

const initialState = {
    isFetching: false,
    tableData: []
};

const tableRendererReducer = function(state = initialState, action) {

    switch (action.type) {

        case types.SEND_REMOTE_REQUEST: {
            return {
                ...state,
                isFetching: true
            };
        }

        case types.GET_TABLE_FILE_SUCCESS: {
            return {
                ...state,
                isFetching: false,
                tableData: action.fileContent
            };
        }

    }

    return state;

};

export default tableRendererReducer;

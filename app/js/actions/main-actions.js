import * as types from './action-types';

export function sendRemoteRequest() {
    return {
        type: types.SEND_REMOTE_REQUEST
    };
}

export function getRemoteError(error) {
    return {
        type: types.GET_REMOTE_ERROR,
        error
    };
}

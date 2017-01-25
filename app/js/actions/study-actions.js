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

export function getStudiesSuccess(studies) {
    return {
        type: types.GET_STUDIES_SUCCESS,
        studies
    };
}

export function showNextXItemsInFacet(facetName) {
    return {
        type: types.SHOW_NEXT_X_ITEMS_IN_FACET,
        facetName
    };
}

export function showAllItemsInFacet(facetName) {
    return {
        type: types.SHOW_ALL_ITEMS_IN_FACET,
        facetName
    };
}

export function resetItemsInFacet(facetName) {
    return {
        type: types.RESET_ITEMS_IN_FACET,
        facetName
    };
}

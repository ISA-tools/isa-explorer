import * as types from './action-types';

export function getStudiesSuccess(studies, params) {
    return {
        type: types.GET_STUDIES_SUCCESS,
        studies,
        params
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

export function toggleFacetItem(facetName, facetItem) {
    return {
        type: types.TOGGLE_FACET_ITEM,
        facetName,
        facetItem
    };
}

export function updateActiveStudies(queryText, activeStudies) {
    return {
        type: types.UPDATE_ACTIVE_STUDIES,
        queryText,
        activeStudies
    };
}

export function resetActiveStudies() {
    return {
        type: types.RESET_ACTIVE_STUDIES
    };
}

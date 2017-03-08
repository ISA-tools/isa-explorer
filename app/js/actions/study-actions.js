import * as types from './action-types';

export function getInvestigationSuccess(investigation, jsonld) {
    return {
        type: types.GET_INVESTIGATION_SUCCESS,
        investigation,
        jsonld
    };
}

export function getTableFileSuccess(fileContent, investigation) {
    return {
        type: types.GET_TABLE_FILE_SUCCESS,
        fileContent,
        investigation
    };
}

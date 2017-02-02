import * as types from './action-types';

export function getInvestigationFileSuccess(fileContent) {
    return {
        type: types.GET_INVESTIGATION_FILE_SUCCESS,
        fileContent
    };
}

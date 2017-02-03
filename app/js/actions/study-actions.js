import * as types from './action-types';

export function getInvestigationFileSuccess(investigation) {
    return {
        type: types.GET_INVESTIGATION_FILE_SUCCESS,
        investigation
    };
}

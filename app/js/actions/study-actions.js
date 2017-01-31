import * as types from './action-types';

export function getStudyFileSuccess(fileContent) {
    return {
        type: types.GET_STUDY_FILE_SUCCESS,
        fileContent
    };
}

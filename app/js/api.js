import Papa from 'papaparse';

import store from './store';

import { STUDY_FILE_NAME } from './utils/constants';
import { handleHTTPErrors } from './utils/helper-funcs';
import { sendRemoteRequest, getRemoteError } from './actions/main-actions';
import { getStudiesSuccess } from './actions/studies-actions';
import { getInvestigationFileSuccess, getTableFileSuccess } from './actions/study-actions';
import ISATab from './model/ISATab';

/**
 * @method
 * @name getStudies
 * @description Get the studies. At the moment returns all the studies at once. Some pagination might be required afterwards
 * @return Promise
 */
export function getStudies() {
    store.dispatch(sendRemoteRequest());
    return fetch('/study')
        .then(handleHTTPErrors)
        .then(response => response.json())
        .then(json => {
            store.dispatch(getStudiesSuccess(json));
        })
        .catch(err => {
            store.dispatch(getRemoteError(err));
            console.log(err.stack);
        });
}

/**
 * @method
 * @name getStudyFile
 * @description Get the study file
 * @param{string} location - the file location
 * @return Promise
 */
export function getInvestigationFile(dirName) {
    store.dispatch(sendRemoteRequest());
    let isa;
    return fetch(`/investigationFile/${dirName}`)
        .then(handleHTTPErrors)
        .then(response => response.text())
        .then(text => {
            isa = new ISATab(text);
            const { studies: [study = {}, ...rest] = [] } = isa.investigation;
            return study[STUDY_FILE_NAME];
        })
        .then(studyFileName => {
            return fetch(`/data/${dirName}/${studyFileName}`);
        })
        .then(response => response.text())
        .then(text => {
            isa.addSamplesToStudy(text);
            store.dispatch(getInvestigationFileSuccess(isa.investigation));
        })
        .catch(err => {
            store.dispatch(getRemoteError(err));
            console.log(err.stack);
        });
}

/**
 * @method
 * @name getTableFile
 * @description retrieves the specified file and returns the text as a 2D array
 * @param{string} dirName
 * @param{string} fileName
 * @return Promise
 */
export function getTableFile(dirName, fileName) {
    store.dispatch(sendRemoteRequest());
    return fetch(`/data/${dirName}/${fileName}`)
        .then(handleHTTPErrors)
        .then(response => response.text())
        .then(text => {
            const parsed = Papa.parse(text);
            if (parsed.errors.length) {
                throw new Error(`Error while parsing isa table file: ${dirName}/${fileName}`);
            }
            store.dispatch(getTableFileSuccess(parsed.data));
        })
        .catch(err => {
            store.dispatch(getRemoteError(err));
            console.log(err.stack);
        });
}

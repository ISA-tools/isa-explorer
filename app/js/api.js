import store from './store';
import { handleHTTPErrors } from './utils/helper-funcs';
import { sendRemoteRequest, getRemoteError } from './actions/main-actions';
import { getStudiesSuccess } from './actions/studies-actions';
import { getInvestigationFileSuccess } from './actions/study-actions';
import ISATab from './model/ISATab';

/**
 * @method
 * @name getStudies
 * @description Get the studies. At the moment returns all the studies at once. Some pagination might be required afterwards
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
 */
export function getInvestigationFile(dirName) {
    store.dispatch(sendRemoteRequest());
    return fetch(`/investigationFile/${dirName}`)
        .then(handleHTTPErrors)
        .then(response => response.text())
        .then(text => {
            const isa = new ISATab(text);
            store.dispatch(getInvestigationFileSuccess(isa.investigation));
        })
        .catch(err => {
            store.dispatch(getRemoteError(err));
            console.log(err.stack);
        });
}

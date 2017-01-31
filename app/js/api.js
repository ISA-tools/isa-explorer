import store from './store';
import { handleHTTPErrors } from './utils/helper-funcs';
import { sendRemoteRequest, getRemoteError } from './actions/main-actions';
import { getStudiesSuccess } from './actions/studies-actions';
import { getStudyFileSuccess } from './actions/study-actions';

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
export function getStudyFile(dirName) {
    store.dispatch(sendRemoteRequest());
    return fetch(`/investigationFile/${dirName}`)
        .then(handleHTTPErrors)
        .then(response => response.text())
        .then(text => {
            store.dispatch(getStudyFileSuccess(text));
        })
        .catch(err => {
            store.dispatch(getRemoteError(err));
            console.log(err.stack);
        });
}

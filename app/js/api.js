import store from './store';
import { handleHTTPErrors } from './utils/helper-funcs';
import * as actions from './actions/study-actions';

/**
 * @method
 * @name getStudies
 * @description Get the studies. At the moment returns all the studies at once. Some pagination might be required afterwards
 */
export function getStudies() {
    store.dispatch(actions.sendRemoteRequest());
    return fetch('/study')
        .then(handleHTTPErrors)
        .then(response => response.json())
        .then(json => {
            store.dispatch(actions.getStudiesSuccess(json));
        })
        /*
        .catch(err => {
            store.dispatch(actions.getRemoteError(err));
        }); */
}

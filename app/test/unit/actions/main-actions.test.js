import test from 'tape';
import { SEND_REMOTE_REQUEST, GET_REMOTE_ERROR } from '../../../js/actions/action-types';
import * as actions from '../../../js/actions/main-actions';

test('sendRemoteRequest()', assert => {
    const expected = {
        type: SEND_REMOTE_REQUEST
    };
    const actual = actions.sendRemoteRequest();
    assert.deepEqual(actual, expected, `Returned message type ${actual.type}, expected message type ${expected.type}`);
    assert.end();
});

test('getRemoteError()', assert => {
    const error = 'Some error message';
    const expected = {type: GET_REMOTE_ERROR, error: 'Some error message'}, actual = actions.getRemoteError(error);
    assert.deepEqual(actual, expected, `Returned message type ${actual.type}, expected message type ${expected.type}`);
    assert.end();
});

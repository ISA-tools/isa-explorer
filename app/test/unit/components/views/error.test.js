import test from 'tape';
import React from 'react';
import { shallow } from 'enzyme';

import { ServerErrorView, NotFoundErrorView, ClientErrorView } from '../../../../js/components/views/error';

test('<ServerErrorView />', assert => {
    const wrapper = shallow(<ServerErrorView />);
    assert.ok(wrapper.hasClass('server-error'), 'The server-error class is correctly set');
    assert.ok(wrapper.text().includes('An unexpected error occurred'), 'The server error message is correctly reported');
    assert.end();
});

test('<NotFoundErrorView />', assert => {
    const wrapper = shallow(<NotFoundErrorView />);
    assert.ok(wrapper.hasClass('not-found-error'), 'The not-found-error class is correctly set');
    assert.ok(wrapper.text().includes('cannot be found'), 'The not found error message is correctly reported');
    assert.end();
});

test('<ClientErrorView />', assert => {
    const wrapper = shallow(<ClientErrorView />);
    assert.ok(wrapper.hasClass('client-error'), 'The not-found-error class is correctly set');
    assert.end();
});

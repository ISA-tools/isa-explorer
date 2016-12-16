import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import DataDescriptor from './components/views/data-descriptor';

ReactDOM.render(<Router history={browserHistory}>
    <Route path="dataDescriptor">
        <Route path=":dataDecriptorId" component={DataDescriptor} />
    </Route>
</Router>, document.getElementById('react-root'));

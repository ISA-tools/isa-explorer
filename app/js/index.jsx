import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import Study from './components/views/study';

ReactDOM.render(<Router history={browserHistory}>
    <Route path="study">
        <Route path=":studyId" component={Study} />
    </Route>
</Router>, document.getElementById('react-root'));

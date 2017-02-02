import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import StudiesContainer from './components/containers/studies-container';
import StudyContainer from './components/containers/study-container';

export default (
    <Router history={browserHistory}>
        <Route path='/'>
            <IndexRoute component={StudiesContainer} />
            <Route path=':dirName' component={StudyContainer} />
            {   /*
            <Route path="study">
                <Route path=":dirName" component={StudyContainer} />
            </Route>
                 */ }
        </Route>
    </Router>
);

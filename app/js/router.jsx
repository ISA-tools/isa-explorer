import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import StudiesContainer from './components/containers/studies-container';

export default (
    <Router history={browserHistory}>
        <Route path='/' component={StudiesContainer} >
            {   /*
            <Route path="study">
                <Route path=":studyId" component={{}} />
            </Route>
                */ }
        </Route>
    </Router>
);

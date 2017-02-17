import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import StudiesContainer from './components/containers/studies-container';
import StudyContainer from './components/containers/study-container';
import TableRendererContainer from './components/containers/tableRenderer-container';


export default (
    <Router onUpdate={() => window.scrollTo(0, 0)} history={browserHistory}>
        <Route path='/'>
            <IndexRoute component={StudiesContainer} />
            <Route path=':dirName' component={StudyContainer} ></Route>
            <Route path=':dirName/:fileName' component={TableRendererContainer} />
        </Route>
    </Router>
);

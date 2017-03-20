import '../../assets/css/style.css';
import 'bootstrap-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';

import StudiesContainer from './components/containers/studies-container';
import StudyContainer from './components/containers/study-container';
import TableRendererContainer from './components/containers/tableRenderer-container';

import store from './store';

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(<Provider store={store}>
    <Router onUpdate={() => window.scrollTo(0, 0)} history={history}>
        <Route path='/'>
            <IndexRoute component={StudiesContainer} />
            <Route path=':dirName' component={StudyContainer} ></Route>
            <Route path=':dirName/:fileName' component={TableRendererContainer} />
        </Route>
    </Router>
</Provider>, document.getElementById('reactCnt'));

import { combineReducers } from 'redux';
import studiesReducer from './studies-reducer';
import studyReducer from './study-reducer';
import tableRendererReducer from './tableRenderer-reducer';
import { routerReducer } from 'react-router-redux';

const reducers = combineReducers({
    studiesState: studiesReducer,
    studyState: studyReducer,
    tableRendererState: tableRendererReducer,
    routing: routerReducer
});

export default reducers;

import { combineReducers } from 'redux';
import studiesReducer from './studies-reducer';
import studyReducer from './study-reducer';
import tableRendererReducer from './tableRenderer-reducer';

const reducers = combineReducers({
    studiesState: studiesReducer,
    studyState: studyReducer,
    tableRendererState: tableRendererReducer
});

export default reducers;

import { combineReducers } from 'redux';
import studiesReducer from './studies-reducer';
import studyReducer from './study-reducer';

const reducers = combineReducers({
    studiesState: studiesReducer,
    studyState: studyReducer
});

export default reducers;

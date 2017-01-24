import { combineReducers } from 'redux';
import studyReducer from './study-reducer';

const reducers = combineReducers({
    studyState: studyReducer
});

export default reducers;

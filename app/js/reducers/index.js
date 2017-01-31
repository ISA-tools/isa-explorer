import { combineReducers } from 'redux';
import studiesReducer from './studies-reducer';

const reducers = combineReducers({
    studiesState: studiesReducer
});

export default reducers;

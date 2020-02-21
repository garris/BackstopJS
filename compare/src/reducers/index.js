import { combineReducers } from 'redux';
import tests from './tests';
import suiteInfo from './suiteInfo';
import layoutSettings from './layoutSettings';
import scrubber from './scrubber';

const rootReducer = combineReducers({
  suiteInfo,
  tests,
  scrubber,
  layoutSettings
});

export default rootReducer;

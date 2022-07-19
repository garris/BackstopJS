import { combineReducers } from 'redux';
import tests from './tests';
import suiteInfo from './suiteInfo';
import layoutSettings from './layoutSettings';
import scrubber from './scrubber';
import logs from './logs';

const rootReducer = combineReducers({
  suiteInfo,
  tests,
  scrubber,
  logs,
  layoutSettings
});

export default rootReducer;

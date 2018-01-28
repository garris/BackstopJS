import { combineReducers } from 'redux';
import tests from './tests';
import suiteInfo from './suiteInfo';
import layoutSettings from './layoutSettings';
import availableStatus from './availableStatus';
import scrubber from './scrubber';

const rootReducer = combineReducers({
  suiteInfo,
  tests,
  availableStatus,
  scrubber,
  layoutSettings
});

export default rootReducer;

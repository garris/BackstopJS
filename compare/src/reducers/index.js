import { combineReducers } from 'redux'
import tests from './tests'
import suiteInfo from './suiteInfo'
import layoutSettings from './layoutSettings'
import availableStatus from './availableStatus'

const rootReducer = combineReducers({
  suiteInfo,
  tests,
  availableStatus,
  layoutSettings
})

export default rootReducer

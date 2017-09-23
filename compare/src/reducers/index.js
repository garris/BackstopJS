import { combineReducers } from 'redux'
import tests from './tests'
import suiteInfo from './suiteInfo'
import layoutSettings from './layoutSettings'

const rootReducer = combineReducers({
  suiteInfo,
  tests,
  layoutSettings
})

export default rootReducer

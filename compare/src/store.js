import { createStore } from 'redux';
import rootReducer  from './reducers';

const defaultState = {
  suiteInfo: {
    testSuiteName: window.tests.testSuite,
    idConfig: 'backstop_default'
  },
  tests: window.tests.tests,
  layoutSettings: {
    refImage: true,
    testImage: true,
    diffImage: true
  }
};

const store = createStore(
  rootReducer,
  defaultState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default store;

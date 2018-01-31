import { createStore } from 'redux';
import rootReducer from './reducers';

const defaultState = {
  suiteInfo: {
    testSuiteName: window.tests.testSuite,
    idConfig: window.tests.id
  },
  tests: {
    all: window.tests.tests,
    filtered: window.tests.tests,
    filterStatus: 'all'
  },
  availableStatus: [
    {
      id: 'all',
      label: 'all',
      count: window.tests.tests.length
    },
    {
      id: 'pass',
      label: 'passed',
      count: window.tests.tests.filter(e => e.status === 'pass').length
    },
    {
      id: 'fail',
      label: 'failed',
      count: window.tests.tests.filter(e => e.status === 'fail').length
    }
  ],
  scrubber: {
    visible: false,
    mode: 'scrub',
    test: {}
  },
  layoutSettings: {
    textInfo: false,
    refImage: true,
    testImage: true,
    diffImage: true
  }
};

const store = createStore(
  rootReducer,
  defaultState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;

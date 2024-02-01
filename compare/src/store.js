import { createStore } from 'redux';
import rootReducer from './reducers';

/**
 * Parses a JSON string from local storage and handles any errors.
 *
 * This function attempts to parse a JSON string provided in `localStorageItem`.
 * If the parsing fails (typically due to corrupt or invalid JSON data),
 * it logs the error, warns the user, and removes the corrupted item from
 * local storage. If parsing is successful, it returns the parsed object.
 * In the case of an error, it returns `false`.
 *
 * @param {string} localStorageItem - The JSON string to parse, typically retrieved from local storage.
 * @returns {object|boolean} The parsed JSON object, or `false` if settings aren't set or parsing fails.
 */
function parseLocalStorage (localStorageItem) {
  let data;
  try {
    data = JSON.parse(localStorageItem);
  } catch (error) {
    console.error(error);
    console.warn('BackstopJS LocalStorage settings appear to be corrupted. Let me fix that for you.');
    localStorage.removeItem('backstopjs');
    data = false;
  }
  return data;
}

/**
 * Retrieves the state from local storage, if available.
 * @returns {object|boolean} The persisted state object or false if not available.
 */
const localState = localStorage.getItem('backstopjs');
const persistedState = localState
  ? parseLocalStorage(localState)
  : false;

/**
 * Default state for the Redux store.
 */
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

/**
 * Merges persisted state with default state if available, otherwise uses default state.
 */
const state = persistedState
  ? {
      ...defaultState,
      ...persistedState
    }
  : defaultState;

/**
 * Creates the Redux store with root reducer, initial state, and devtools extension.
 * TODO: Consider using Redux Toolkit for more efficient and modern state management.
 */
const store = createStore(
  rootReducer,
  state,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

/**
 * Subscribes to store changes to persist layout settings in local storage.
 */
store.subscribe(function () {
  const layoutSettings = store.getState().layoutSettings;
  const localStateItems = JSON.stringify({
    layoutSettings
  });
  localStorage.setItem('backstopjs', localStateItems);
});

export default store;

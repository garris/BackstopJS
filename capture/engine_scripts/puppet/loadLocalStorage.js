var fs = require('fs');

/*
  This code is called after the command to navigate has been fired.
  before the delay, before the wait for an element to render (readySelector) and before the code that runs just before taking the picture (readyEvent).

  If the data is like this:
  +------------------------+--------------+
  |         Key:           |     value:   |
  +------------------------+--------------+
  |amplitude_lastEventId   |             2|
  |amplitude_lastEventTime | 1543336128855|
  |amplitude_sessionId     | 1543336128827|
  |amplitude_unsent        |            []|
  +------------------------+--------------+

  The json should be like this:
  {
    "amplitude_lastEventId": "2",
    "amplitude_lastEventTime": "1543336128855",
    "amplitude_sessionId": "1543336128827",
    "amplitude_unsent": "[]"
  }
*/

async function loadLocalStorageData (path, page) {
  const localStorageData = JSON.parse(fs.readFileSync(path));
  await page.evaluate(json => {
    for (let key in json) {
      window.localStorage.setItem(key, json[key]);
    }
  }, localStorageData);
}

module.exports = async (page, scenario, localStorageDataPath) => {
  window.localStorage.clear();
  await loadLocalStorageData(localStorageDataPath, page);
  // TODO: decide to only show this when debugging. And how to figure out if debug is on.
  console.log('Local storage state restored with: ', JSON.stringify(window.localStorage, null, 2));
};

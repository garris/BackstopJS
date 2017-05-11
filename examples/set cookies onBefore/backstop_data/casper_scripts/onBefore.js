
module.exports = function (casper, scenario, vp) {
  // This script runs before your app loads. Edit here to log-in, load cookies or set other states required for your test.
  console.log('onBefore.js has run for ' + vp.name + '.');

  if (scenario.testCookieValue) {
    var cookieShim = [
      {
        "domain": ".",
        "path": "/",
        "expirationDate": 1528614000,
        "name": "testCookieValue",
        "value": scenario.testCookieValue,
        "hostOnly": false,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "id": 1000
      }
    ]
    console.log('setting a single testCookieValue: ' + scenario.testCookieValue);
    casper.page.cookies = cookieShim;
  } else {
    casper.page.cookies = [];
    console.log('Clearing all cookies.');
  }
};

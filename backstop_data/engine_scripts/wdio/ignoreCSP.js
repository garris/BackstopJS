/**
 * IGNORE CSP HEADERS
 * Listen to all requests. If a request matches scenario.url
 * then fetch the request again manually, strip out CSP headers
 * and respond to the original request without CSP headers.
 * Allows `ignoreHTTPSErrors: true` BUT... requires `debugWindow: true`
 *
 * see https://github.com/GoogleChrome/puppeteer/issues/1229#issuecomment-380133332
 *
 * @TODO implement a wdio solution here (proxy maybe?)
 */

module.exports = async function (browser, scenario) {
  // this feature is not available
};

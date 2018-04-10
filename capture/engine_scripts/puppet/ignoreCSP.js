/**
 * IGNORE CSP HEADERS
 * Pass in a request. If it matches scenario.url then fetch the request manually and return it without the CSP headers (if any).
 *
 * @param      {REQUEST}  request
 * @return     {VOID}
 *
 * Use this in an onBefore script E.G.
  ```
  module.exports = async function(page, scenario) {
    require('./removeCSP')(page, scenario);
  }
  ```
 *
 * NOTE: as of this writing -- `debugWindow: true` is required for this to work.
 */

const fetch = require('node-fetch');
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false
});

module.exports = async function (page, scenario) {
  const intercept = async (request, targetUrl) => {
    const requestUrl = request.url();

    // FIND TARGET URL REQUEST
    if (requestUrl === targetUrl) {
      const cookiesList = await page.cookies(requestUrl);
      const cookies = cookiesList.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
      const headers = Object.assign(request.headers(), {cookie: cookies});
      const init = {
        headers: headers,
        body: request.postData(),
        method: request.method(),
        follow: 20,
        agent
      };

      const result = await fetch(requestUrl, init);

      const buffer = await result.buffer();
      let cleanedHeaders = result.headers._headers || {};
      cleanedHeaders['content-security-policy'] = '';
      await request.respond({
        body: buffer,
        headers: cleanedHeaders,
        status: result.status
      });
    } else {
      request.continue();
    }
  };

  await page.setRequestInterception(true);
  page.on('request', req => {
    intercept(req, scenario.url);
  });
};

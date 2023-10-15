const fs = require('fs');

module.exports = async (page, scenario) => {
  const cookies = [];
  const cookiePath = scenario.cookiePath;

  // READ COOKIES FROM FILE IF EXISTS
  if (fs.existsSync(cookiePath)) {
    cookies = JSON.parse(fs.readFileSync(cookiePath));
  }

  // Inject cookie domain, url, secure from scenario url.
  const url = new URL(scenario.url);
  cookies = cookies.map(cookie => {
    cookie.url = `${url.protocol}//${url.hostname}`;
    cookie.domain = url.hostname;
    if(url.protocol === 'https:') {
      cookie.secure = true;
    }
    return cookie;
  });

  // SET COOKIES
  const setCookies = async () => {
    return Promise.all(
      cookies.map(async (cookie) => {
        await page.setCookie(cookie);
      })
    );
  };
  await setCookies();
  console.log('Cookie state restored with:', JSON.stringify(cookies, null, 2));
};

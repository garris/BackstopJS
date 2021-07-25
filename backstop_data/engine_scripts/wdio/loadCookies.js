const fs = require('fs');

module.exports = async (browser, scenario) => {
  let cookies = [];
  const cookiePath = scenario.cookiePath;

  // READ COOKIES FROM FILE IF EXISTS
  if (fs.existsSync(cookiePath)) {
    cookies = JSON.parse(fs.readFileSync(cookiePath));
  }

  // MUNGE COOKIE DOMAIN
  cookies = cookies.map(cookie => {
    if (cookie.domain.startsWith('http://') || cookie.domain.startsWith('https://')) {
      cookie.url = cookie.domain;
    } else {
      cookie.url = 'https://' + cookie.domain;
    }
    delete cookie.domain;
    return cookie;
  });

  // SET COOKIES
  const setCookies = async () => {
    try {
      await browser.setCookies(cookies);
    } catch (e) {
      console.log(e);
    }
  };
  await setCookies();
  console.log('Cookie state restored with:', JSON.stringify(cookies, null, 2));
};

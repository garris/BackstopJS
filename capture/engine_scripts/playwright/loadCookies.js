const fs = require('fs');

module.exports = async (browserContext, scenario) => {
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
  browserContext.addCookies(cookies);

  console.log('Cookie state restored with:', JSON.stringify(cookies, null, 2));
};

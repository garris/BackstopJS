module.exports = async (page, scenario, vp) => {
  await require('./loadCookies')(page, scenario);

  // Emulate iPhone
  if (vp.label == 'iPhone6,6s,7,8') {
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1');
  }

  // Custom Timeout
  await page.setDefaultNavigationTimeout(300000);
};

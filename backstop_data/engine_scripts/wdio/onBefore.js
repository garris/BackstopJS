module.exports = async (browser, scenario, vp) => {
  await require('./loadCookies')(browser, scenario);
};

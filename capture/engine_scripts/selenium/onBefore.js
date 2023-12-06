module.exports = async (driver, scenario, vp) => {
  await require('./loadCookies')(driver, scenario);
};

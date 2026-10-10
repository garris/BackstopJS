module.exports = function (config) {
  const { ignoreHTTPSErrors, ...engineOptions } = config.engineOptions || {};
  const options = {
    acceptInsecureCerts: true,
    headless: !config.debugWindow,
    ...engineOptions
  };

  if (engineOptions.acceptInsecureCerts === undefined && ignoreHTTPSErrors !== undefined) {
    options.acceptInsecureCerts = ignoreHTTPSErrors;
  }

  if (options.headless === 'new') {
    options.headless = true;
  }

  return options;
};

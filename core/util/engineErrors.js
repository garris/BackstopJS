module.exports = function (config) {
  const compareConfig = require(config.tempCompareConfigFileName).compareConfig;
  const error = compareConfig.testPairs.find(testPair => {
    return !!testPair.engineErrorMsg;
  });

  if (error) {
    return Promise.reject(error);
  }
  return Promise.resolve();
};

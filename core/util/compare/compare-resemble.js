const resemble = require('@mirzazeyrek/node-resemble-js');

module.exports = function (referencePath, testPath, misMatchThreshold, resembleOutputSettings, requireSameDimensions) {
  return new Promise(function (resolve, reject) {
    const resembleSettings = resembleOutputSettings || {};
    resemble.outputSettings(resembleSettings);
    const comparison = resemble(referencePath).compareTo(testPath);

    if (resembleSettings.ignoreAntialiasing) {
      comparison.ignoreAntialiasing();
    }

    comparison.onComplete(data => {
      const misMatchPercentage = resembleSettings.usePreciseMatching ? data.rawMisMatchPercentage : data.misMatchPercentage;
      if ((requireSameDimensions === false || data.isSameDimensions === true) && misMatchPercentage <= misMatchThreshold) {
        return resolve(data);
      }
      reject(data);
    });
  });
};

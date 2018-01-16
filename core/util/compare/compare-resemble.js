var resemble = require('node-resemble-js');

module.exports = function (referencePath, testPath, misMatchThreshold, resembleOutputSettings, requireSameDimensions) {
  return new Promise(function (resolve, reject) {
    resemble.outputSettings(resembleOutputSettings || {});
    var comparison = resemble(referencePath).compareTo(testPath);

    if (resembleOutputSettings && resembleOutputSettings.ignoreAntialiasing) {
      comparison.ignoreAntialiasing();
    }

    comparison.onComplete(data => {
      if ((requireSameDimensions === false || data.isSameDimensions === true) && data.misMatchPercentage <= misMatchThreshold) {
        return resolve(data);
      }
      reject(data);
    });
  });
};

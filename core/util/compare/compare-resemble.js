var resemble = require('node-resemble-js');

module.exports = function (referencePath, testPath, misMatchThreshold, resembleOutputSettings, requireSameDimensions) {
  return new Promise(function (resolve, reject) {
    resemble.outputSettings(resembleOutputSettings || {});
    resemble(referencePath).compareTo(testPath).onComplete(data => {
      if ((requireSameDimensions === false || data.isSameDimensions === true) && data.misMatchPercentage <= misMatchThreshold) {
        return resolve(data);
      }
      reject(data)
    });
  });
};

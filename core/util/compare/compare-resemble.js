var resemble = require('node-resemble-js');

module.exports = function (referencePath, testPath, misMatchThreshold, resembleOutputSettings) {
  return new Promise(function (resolve, reject) {
    resemble.outputSettings(resembleOutputSettings || {});
    resemble(referencePath).compareTo(testPath).onComplete(data => {
      if (data.isSameDimensions && data.misMatchPercentage <= misMatchThreshold) {
        return resolve(data);
      }
      reject(data)
    });
  });
};

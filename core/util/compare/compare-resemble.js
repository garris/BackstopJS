var compareImages = require('resemblejs/compareImages');
var fs = require('fs');

module.exports = function (referencePath, testPath, misMatchThreshold, resembleOutputSettings, requireSameDimensions) {
  return new Promise(async function (resolve, reject) {
    const data = await compareImages(
      fs.readFileSync(referencePath),
      fs.readFileSync(testPath),
      //resembleOutputSettings WILL GO HERE WITH SOME DEFAULT SETTING
    );

    if ((requireSameDimensions === false || data.isSameDimensions === true) && data.misMatchPercentage <= misMatchThreshold) {
      return resolve(data);
    }

    reject(data);
  });
};

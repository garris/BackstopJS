var compareImages = require('resemblejs/compareImages');
var fs = require('fs')

module.exports = async function (referencePath, testPath, misMatchThreshold, resembleOutputSettings, requireSameDimensions) {
  console.log('rs')

  return new Promise(async function (resolve, reject) {
    const options = {
      output: {
          errorColor: {
              red: 0,
              green: 255,
              blue: 255
          }
      },
      ignore: "nothing"
    };

    const data = await compareImages(
      fs.readFileSync(referencePath),
      fs.readFileSync(testPath),
      options
    );

    if ((requireSameDimensions === false || data.isSameDimensions === true) && data.misMatchPercentage <= misMatchThreshold) {
      return resolve(data);
    }

    reject(data);
  });
};

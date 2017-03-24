var compareHashes = require('./compare-hash');
var compareResemble = require('./compare-resemble');

module.exports = function (referencePath, testPath, misMatchThreshold, resembleOutputSettings, requireSameDimensions) {
  return compareHashes(referencePath, testPath)
     .catch(() => compareResemble(referencePath, testPath, misMatchThreshold, resembleOutputSettings, requireSameDimensions));
};

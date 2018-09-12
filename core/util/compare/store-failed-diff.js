const fs = require('fs');
const path = require('path');

module.exports = function (testPath, data) {
  var failedDiffFilename = getFailedDiffFilename(testPath);
  console.log('   See:', failedDiffFilename);

  fs.writeFileSync(failedDiffFilename, data.getBuffer());

  return Promise.resolve(failedDiffFilename);
};

function getFailedDiffFilename (testPath) {
  var lastSlash = testPath.lastIndexOf(path.sep);
  return testPath.slice(0, lastSlash + 1) + 'failed_diff_' + testPath.slice(lastSlash + 1, testPath.length);
}

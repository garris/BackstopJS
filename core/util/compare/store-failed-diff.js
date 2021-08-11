const streamToPromise = require('./../streamToPromise');
const fs = require('fs');
const path = require('path');

module.exports = function (testPath, data) {
  const failedDiffFilename = getFailedDiffFilename(testPath);
  console.log('   See:', failedDiffFilename);

  const failedDiffStream = fs.createWriteStream(failedDiffFilename);
  const ext = failedDiffFilename.substring(failedDiffFilename.lastIndexOf('.') + 1);

  if (ext === 'png') {
    const storageStream = data.getDiffImage()
      .pack()
      .pipe(failedDiffStream);
    return streamToPromise(storageStream, failedDiffFilename);
  }

  if (ext === 'jpg' || ext === 'jpeg') {
    fs.writeFileSync(failedDiffFilename, data.getDiffImageAsJPEG(85));
    return Promise.resolve(failedDiffFilename);
  }
};

function getFailedDiffFilename (testPath) {
  const lastSlash = testPath.lastIndexOf(path.sep);
  return testPath.slice(0, lastSlash + 1) + 'failed_diff_' + testPath.slice(lastSlash + 1, testPath.length);
}

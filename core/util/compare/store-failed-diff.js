var streamToPromise = require('./../streamToPromise');
const fs = require('fs');
const path = require('path');

module.exports = function(testPath, data) {
  var failedDiffFilename = getFailedDiffFilename(testPath);
  console.log('   See:', failedDiffFilename);

  var failedDiffStream = fs.createWriteStream(failedDiffFilename);
  var ext = failedDiffFilename.substring(failedDiffFilename.lastIndexOf('.') + 1);

  if (ext === 'png') {
    var storageStream = data.getDiffImage()
      .pack()
      .pipe(failedDiffStream);
    return streamToPromise(storageStream, failedDiffFilename);
  }

  if (ext === 'jpg' || ext === 'jpeg') {
    fs.writeFileSync(failedDiffFilename, data.getDiffImageAsJPEG(85));
    return Promise.resolve(failedDiffFilename);
  }
}

function getFailedDiffFilename (testPath) {
  var lastSlash = testPath.lastIndexOf(path.sep);
  return testPath.slice(0, lastSlash + 1) + 'failed_diff_' + testPath.slice(lastSlash + 1, testPath.length);
}

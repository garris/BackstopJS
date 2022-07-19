const fs = require('fs');
const path = require('path');

// BASE64_PNG_STUB is 1x1 white pixel
const BASE64_PNG_STUB = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

// Utility to ensure `backstop approve` finds a diff image
// call when no reference image exists.
module.exports = function (testPath) {
  fs.writeFileSync(getFailedDiffFilename(testPath), BASE64_PNG_STUB, 'base64');
};

function getFailedDiffFilename (testPath) {
  const lastSlash = testPath.lastIndexOf(path.sep);
  return testPath.slice(0, lastSlash + 1) + 'failed_diff_' + testPath.slice(lastSlash + 1, testPath.length);
}

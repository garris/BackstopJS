const path = require('path');
const fs = require('fs');

function ensureDirectoryPath (filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryPath(dirname);
  fs.mkdirSync(dirname);
}

module.exports = function (path) {
  return ensureDirectoryPath(path);
};

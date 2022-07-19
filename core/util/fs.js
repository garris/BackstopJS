const fs = require('fs');
const fsExtra = require('fs-extra');
const promisify = require('./promisify');

const fsPromisified = {
  readdir: promisify(fs.readdir),
  createWriteStream: fs.createWriteStream,
  existsSync: fs.existsSync,
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  ensureDir: promisify(fsExtra.ensureDir),
  unlink: promisify(fs.unlink),
  remove: promisify(fsExtra.remove),
  stat: promisify(fs.stat),
  copy: promisify(fsExtra.copy),
  exists: function exists (file) {
    return fsPromisified.stat(file)
      .then(function (args) {
        return args[0];
      })
      .catch(function () {
        return false;
      });
  }
};

module.exports = fsPromisified;

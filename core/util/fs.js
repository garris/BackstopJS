var fs = require('fs');
var fsExtra = require('fs-extra');
var copy = require('copy');
var promisify = require('./promisify');

var fsPromisified = {
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  unlink: promisify(fs.unlink),
  stat: promisify(fs.stat),
  copy: promisify(fsExtra.copy),
  copyGlob: promisify(copy),
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

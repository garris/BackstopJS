var fs = require('fs');
var promisify = require('./promisify');

var fsPromisified = {
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  unlink: promisify(fs.unlink),
  stat: promisify(fs.stat),
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

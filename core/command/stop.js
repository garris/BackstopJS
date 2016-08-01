var fs = require('../util/fs');
var promisify = require('../util/promisify');
var exec = promisify(require('child_process').exec);
var paths = require('../util/paths');

module.exports = {
  execute: function () {
    return fs.exists(paths.serverPidFile)
      .then(function (exists) {
        if (exists) {
          return fs.readFile(paths.serverPidFile);
        } else {
          return null;
        }
      })
      .then(function (pid) {
        if (pid) {
          return exec('kill ' + pid)
            .then(function () {
              console.log('Stopped PID:' + pid);
              return fs.unlink(paths.serverPidFile);
            });
        }
      });
  }
};

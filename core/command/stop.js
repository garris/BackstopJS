var fs = require('../util/fs');
var promisify = require('../util/promisify');
var exec = promisify(require('child_process').exec);

module.exports = {
  execute: function (config) {
    return fs.exists(config.serverPidFile)
      .then(function (exists) {
        if (exists) {
          return fs.readFile(config.serverPidFile)
            .then(function (pid) {
              return pid[0];
            });
        } else {
          return null;
        }
      })
      .then(function (pid) {
        if (pid) {
          return exec('kill ' + pid)
            .then(function () {
              console.log('Stopped PID:' + pid);
              return fs.unlink(config.serverPidFile);
            });
        }
      });
  }
};

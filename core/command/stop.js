var fs = require('fs');
var exec = require('child_process').exec;
var paths = require('../util/paths');

module.exports = {
  execute: function () {
    fs.readFile(paths.serverPidFile, function (err, pid) {
      if (pid) {
        exec('kill ' + pid, function (error, stdout, stderr) {
          console.log('Stopped PID:' + pid);
          fs.unlinkSync(paths.serverPidFile);
        });
      }
    });
  }
};

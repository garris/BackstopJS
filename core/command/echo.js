var runCasper = require('../util/runCasper');

module.exports = {
  execute: function (config) {
    var tests = ['capture/echoFiles.js'];
    var casperChild = runCasper(config, tests);

    return new Promise(function (resolve, reject) {
      casperChild.on('close', function (code) {
        var success = code === 0; // Will be 1 in the event of failure
        var result = success ? 'Echo files completed.' : 'Echo files failed with code: ' + code;

        console.log('\n' + result);

        // exit if there was some kind of failure in the casperChild process
        if (code !== 0) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }
};

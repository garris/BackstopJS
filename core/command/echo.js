var spawn = require('child_process').spawn;
var getCasperArgs = require('../util/getCasperArgs');

module.exports = {
  execute: function (config) {
    var tests = ['capture/echoFiles.js'];

    var casperArgs = getCasperArgs(config, tests);
    console.log('\nRunning CasperJS with: ', casperArgs);

    var casperProcess = (process.platform === 'win32' ? 'casperjs.cmd' : 'casperjs');
    var casperChild = spawn(casperProcess, casperArgs);

    casperChild.stdout.on('data', function (data) {
      console.log('CasperJS:', data.toString().slice(0, -1)); // Remove \n
    });

    return new Promise(function (resolve, reject) {
      casperChild.on('close', function (code) {
        var success = code === 0; // Will be 1 in the event of failure
        var result = success
          ? 'Echo files completed.'
          : 'Echo files failed with code: ' + code;

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

var path = require('path');

var fs = require('./fs');
var each = require('./each');
var runCasper = require('./runCasper');

var logger = require('./logger')('createBitmaps');

function includes (string, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > this.length) {
    return false;
  } else {
    return string.indexOf(search, start) !== -1;
  }
}

function writeReferenceCreateConfig (config, isReference) {
  var configJSON = require(config.backstopConfigFileName);

  configJSON.isReference = isReference;
  configJSON.paths.tempCompareConfigFileName = config.tempCompareConfigFileName;
  configJSON.defaultMisMatchThreshold = config.defaultMisMatchThreshold;
  configJSON.backstopConfigFileName = config.backstopConfigFileName;

  if (config.args.filter) {
    var scenarii = [];

    config.args.filter.split(',').forEach(function (filteredTest) {
      each(configJSON.scenarios, function (scenario) {
        if (includes(scenario.label, filteredTest)) {
          scenarii.push(scenario);
        }
      });
    });

    logger.log('Will generate ' + scenarii.length + ' out of ' + configJSON.scenarios.length + ' scenarii');

    configJSON.scenarios = scenarii;
  }

  return fs.writeFile(config.captureConfigFileName, JSON.stringify(configJSON));
}

module.exports = function (config, isReference) {
  return writeReferenceCreateConfig(config, isReference).then(function () {
    var tests = [path.join(config.backstop, 'capture/genBitmaps.js')];
    var casperChild = runCasper(config, tests);

    return new Promise(function (resolve, reject) {
      casperChild.on('close', function (code) {
        var success = code === 0; // Will be 1 in the event of failure
        var result = (success) ? 'Bitmap file generation completed.' : 'Testing script failed with code: ' + code;

        console.log('\n' + result);

        // exit if there was some kind of failure in the casperChild process
        if (code !== 0) {
          console.log('\nAn unexpected error occured. You may want to try setting the debug option to `true` in your config file.');
          reject(new Error('An unexpected error occured. You may want to try setting the debug option to `true` in your config file.'));
          return;
        }

        resolve();
      });
    });
  });
};

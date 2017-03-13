var path = require('path');

var fs = require('./fs');
var each = require('./each');
var runCasper = require('./runCasper');

var logger = require('./logger')('createBitmaps');

var GENERATE_BITMAPS_SCRIPT = 'capture/genBitmaps.js';

function regexTest (string, search) {
  var re = new RegExp(search);
  return re.test(string);
}

/**
 * Utility for generating a temporary config file required by GENERATE_BITMAPS_SCRIPT.
 * @config  {Object}        Base user config object (derrived by user config file + CL param overrides).
 * @isReference  {Boolean}  True if running reference flow.
 * @return {Promise}        Resolves when fs.writeFile has completed.
 */
function writeReferenceCreateConfig (config, isReference) {
  var configJSON;

  if (typeof config.args.config === 'object') {
    configJSON = config.args.config;
  } else {
    configJSON = require(config.backstopConfigFileName);
  }

  configJSON.isReference = isReference;
  configJSON.paths.tempCompareConfigFileName = config.tempCompareConfigFileName;
  configJSON.defaultMisMatchThreshold = config.defaultMisMatchThreshold;
  configJSON.backstopConfigFileName = config.backstopConfigFileName;

  if (config.args.filter) {
    var scenarii = [];

    config.args.filter.split(',').forEach(function (filteredTest) {
      each(configJSON.scenarios, function (scenario) {
        if (regexTest(scenario.label, filteredTest)) {
          scenarii.push(scenario);
        }
      });
    });

    logger.log('Will generate ' + scenarii.length + ' out of ' + configJSON.scenarios.length + ' scenarios');

    configJSON.scenarios = scenarii;
  }

  return fs.writeFile(config.captureConfigFileName, JSON.stringify(configJSON));
}

module.exports = function (config, isReference) {
  return writeReferenceCreateConfig(config, isReference).then(function () {
    var tests = [path.join(config.backstop, GENERATE_BITMAPS_SCRIPT)];
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

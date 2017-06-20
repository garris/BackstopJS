var path = require('path');
var fs = require('./fs');
var each = require('./each');
var pMap = require('p-map');

var runCasper = require('./runCasper');
var runChromy = require('./runChromy');

var logger = require('./logger')('createBitmaps');

var GENERATE_BITMAPS_SCRIPT = 'capture/genBitmaps.js';

function regexTest (string, search) {
  var re = new RegExp(search);
  return re.test(string);
}

function decorateConfigForCapture (config, isReference) {
  var configJSON;

  if (typeof config.args.config === 'object') {
    configJSON = config.args.config;
  } else {
    configJSON = require(config.backstopConfigFileName);
  }
  configJSON.scenarios = configJSON.scenarios || [];

  var totalScenarioCount = configJSON.scenarios.length;

  var screenshotNow = new Date();
  var screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());

  configJSON.screenshotDateTime = screenshotDateTime;
  configJSON.env = config;
  configJSON.isReference = isReference;
  configJSON.paths.tempCompareConfigFileName = config.tempCompareConfigFileName;
  configJSON.defaultMisMatchThreshold = config.defaultMisMatchThreshold;
  configJSON.backstopConfigFileName = config.backstopConfigFileName;
  configJSON.defaultRequireSameDimensions = config.defaultRequireSameDimensions;

  if (config.args.filter) {
    var scenarii = [];
    config.args.filter.split(',').forEach(function (filteredTest) {
      each(configJSON.scenarios, function (scenario) {
        if (regexTest(scenario.label, filteredTest)) {
          scenarii.push(scenario);
        }
      });
    });
    configJSON.scenarios = scenarii;
  }

  logger.log('Selcted ' + configJSON.scenarios.length + ' of ' + totalScenarioCount + ' scenarios.');
  return configJSON;
}

/**
 * Utility for generating a temporary config file required by GENERATE_BITMAPS_SCRIPT.
 * @config  {Object}        Base user config object (derrived by user config file + CL param overrides).
 * @isReference  {Boolean}  True if running reference flow.
 * @return {Promise}        Resolves when fs.writeFile has completed.
 */
function writeReferenceCreateConfig (config, isReference) {
  return fs.writeFile(config.captureConfigFileName, JSON.stringify(decorateConfigForCapture(config, isReference)));
}

function delegateScenarios (config) {
  var screenshotNow = new Date();
  var screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());

  // TODO: start chromy here?  Or later?  maybe later because maybe changing resoloutions doesn't work after starting?
  // casper.start();

  var scenarios = [];
  var scenarioViews = [];

  config.viewports.forEach(function (o, i) {
    o.vIndex = i;
  });

  // casper.each(scenarios, function (casper, scenario, i) {
  config.scenarios.forEach(function (scenario, i) {
    // var scenarioLabelSafe = makeSafe(scenario.label);
    scenario.sIndex = i;
    scenarios.push(scenario);

    if (!config.isReference && scenario.hasOwnProperty('variants')) {
      scenario.variants.forEach(function (variant) {
        // var variantLabelSafe = makeSafe(variant.label);
        variant._parent = scenario;
        scenarios.push(scenario);
        // processScenario(casper, variant, variantLabelSafe, scenarioLabelSafe, viewports, bitmapsReferencePath, bitmapsTestPath, screenshotDateTime);
      });
    }
  });

  scenarios.forEach(function (scenario) {
    config.viewports.forEach(function (viewport) {
      scenarioViews.push({
        scenario: scenario,
        viewport: viewport,
        config: config
      });
    });
  });

  // return Promise.reject(new Error('note yet delegating'));
  return pMap(scenarioViews, runChromy, { concurrency: 2 });
}

function pad (number) {
  var r = String(number);
  if (r.length === 1) {
    r = '0' + r;
  }
  return r;
}

module.exports = function (config, isReference) {
  if (/chromy/.test(config.engine)) {
    return delegateScenarios(decorateConfigForCapture(config, isReference)).then(_ => {console.log('delegateScenarios ran')});
    // return runChromy(decorateConfigForCapture(config, isReference));
  }

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

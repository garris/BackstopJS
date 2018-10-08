const Chromy = require('chromy');
var cloneDeep = require('lodash/cloneDeep');
var path = require('path');
var fs = require('./fs');
var each = require('./each');
var pMap = require('p-map');

var runCasper = require('./runCasper');
var runChromy = require('./runChromy');
var runPuppet = require('./runPuppet');

const ensureDirectoryPath = require('./ensureDirectoryPath');
var logger = require('./logger')('createBitmaps');

var CONCURRENCY_DEFAULT = 10;
const CHROMY_STARTING_PORT_NUMBER = 9222;
var GENERATE_BITMAPS_SCRIPT = 'capture/genBitmaps.js';

function regexTest (string, search) {
  var re = new RegExp(search);
  return re.test(string);
}

function ensureViewportLabel (config) {
  if (typeof config.viewports === 'object') {
    config.viewports.forEach(function (viewport) {
      if (!viewport.label) {
        viewport.label = viewport.name;
      }
    });
  }
}

function decorateConfigForCapture (config, isReference) {
  var configJSON;

  if (typeof config.args.config === 'object') {
    configJSON = config.args.config;
  } else {
    configJSON = Object.assign({}, require(config.backstopConfigFileName));
  }
  configJSON.scenarios = configJSON.scenarios || [];
  ensureViewportLabel(configJSON);

  var totalScenarioCount = configJSON.scenarios.length;

  var screenshotNow = new Date();
  var screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());

  configJSON.screenshotDateTime = screenshotDateTime;
  configJSON.env = cloneDeep(config);
  configJSON.isReference = isReference;
  configJSON.paths.tempCompareConfigFileName = config.tempCompareConfigFileName;
  configJSON.defaultMisMatchThreshold = config.defaultMisMatchThreshold;
  configJSON.backstopConfigFileName = config.backstopConfigFileName;
  configJSON.defaultRequireSameDimensions = config.defaultRequireSameDimensions;

  if (config.args.filter) {
    var scenarios = [];
    config.args.filter.split(',').forEach(function (filteredTest) {
      each(configJSON.scenarios, function (scenario) {
        if (regexTest(scenario.label, filteredTest)) {
          scenarios.push(scenario);
        }
      });
    });
    configJSON.scenarios = scenarios;
  }

  logger.log('Selected ' + configJSON.scenarios.length + ' of ' + totalScenarioCount + ' scenarios.');
  return configJSON;
}

/**
 * Utility for generating a temporary config file required by GENERATE_BITMAPS_SCRIPT.
 * @config  {Object}        Base user config object (derived by user config file + CL param overrides).
 * @isReference  {Boolean}  True if running reference flow.
 * @return {Promise}        Resolves when fs.writeFile has completed.
 */
function writeReferenceCreateConfig (config, isReference) {
  return fs.writeFile(config.captureConfigFileName, JSON.stringify(decorateConfigForCapture(config, isReference)));
}

function saveViewportIndexes (viewport, index) {
  viewport.vIndex = index;
}

function delegateScenarios (config) {
  // TODO: start chromy here?  Or later?  maybe later because maybe changing resolutions doesn't work after starting?
  // casper.start();

  var scenarios = [];
  var scenarioViews = [];

  config.viewports.forEach(saveViewportIndexes);

  // casper.each(scenarios, function (casper, scenario, i) {
  config.scenarios.forEach(function (scenario, i) {
    // var scenarioLabelSafe = makeSafe(scenario.label);
    scenario.sIndex = i;
    scenario.selectors = scenario.selectors || [];
    scenario.viewports && scenario.viewports.forEach(saveViewportIndexes);
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

  var scenarioViewId = 0;
  scenarios.forEach(function (scenario) {
    var desiredViewportsForScenario = config.viewports;

    if (scenario.viewports && scenario.viewports.length > 0) {
      desiredViewportsForScenario = scenario.viewports;
    }

    desiredViewportsForScenario.forEach(function (viewport) {
      scenarioViews.push({
        scenario: scenario,
        viewport: viewport,
        config: config,
        id: scenarioViewId++
      });
    });
  });

  const asyncCaptureLimit = config.asyncCaptureLimit === 0 ? 1 : config.asyncCaptureLimit || CONCURRENCY_DEFAULT;

  if (/chrom./i.test(config.engine)) {
    const PORT = (config.startingPort || CHROMY_STARTING_PORT_NUMBER);
    var getFreePorts = require('./getFreePorts');
    return getFreePorts(PORT, scenarioViews.length).then(freeports => {
      console.log('These ports will be used:', JSON.stringify(freeports));
      scenarioViews.forEach((scenarioView, i) => {
        scenarioView.assignedPort = freeports[i];
      });
      return pMap(scenarioViews, runChromy, { concurrency: asyncCaptureLimit });
    });
  } else if (config.engine.startsWith('puppet')) {
    return pMap(scenarioViews, runPuppet, { concurrency: asyncCaptureLimit });
  } else {
    logger.error('Engine not known to Backstop!');
  }
}

function pad (number) {
  var r = String(number);
  if (r.length === 1) {
    r = '0' + r;
  }
  return r;
}

function writeCompareConfigFile (comparePairsFileName, compareConfig) {
  var compareConfigJSON = JSON.stringify(compareConfig, null, 2);
  ensureDirectoryPath(comparePairsFileName);
  return fs.writeFile(comparePairsFileName, compareConfigJSON);
}

function flatMapTestPairs (rawTestPairs) {
  return rawTestPairs.reduce((acc, result) => {
    var testPairs = result.testPairs;
    if (!testPairs) {
      testPairs = {
        diff: {
          isSameDimensions: '',
          dimensionDifference: {
            width: '',
            height: ''
          },
          misMatchPercentage: ''
        },
        reference: '',
        test: '',
        selector: '',
        fileName: '',
        label: '',
        scenario: result.scenario,
        viewport: result.viewport,
        msg: result.msg,
        error: result.originalError && result.originalError.name
      };
    }
    return acc.concat(testPairs);
  }, []);
}

module.exports = function (config, isReference) {
  if (/chrom./i.test(config.engine) || /puppet/i.test(config.engine)) {
    const promise = delegateScenarios(decorateConfigForCapture(config, isReference))
      .then(rawTestPairs => {
        const result = {
          compareConfig: {
            testPairs: flatMapTestPairs(rawTestPairs)
          }
        };
        return writeCompareConfigFile(config.tempCompareConfigFileName, result);
      });

    if (/chrom./i.test(config.engine)) {
      promise.then(() => Chromy.cleanup());
    }

    return promise;
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
          console.log('\nAn unexpected error occurred. You may want to try setting the debug option to `true` in your config file.');
          reject(new Error('An unexpected error occurred. You may want to try setting the debug option to `true` in your config file.'));
          return;
        }
        resolve();
      });
    });
  });
};

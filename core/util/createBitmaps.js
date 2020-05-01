var cloneDeep = require('lodash/cloneDeep');
var fs = require('./fs');
var each = require('./each');
var pMap = require('p-map');

var runPuppet = require('./runPuppet');

const ensureDirectoryPath = require('./ensureDirectoryPath');
var logger = require('./logger')('createBitmaps');

var CONCURRENCY_DEFAULT = 10;

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

  function pad (number) {
    var r = String(number);
    if (r.length === 1) {
      r = '0' + r;
    }
    return r;
  }
  var screenshotNow = new Date();
  var screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());
  screenshotDateTime = configJSON.dynamicTestId ? configJSON.dynamicTestId : screenshotDateTime;
  configJSON.screenshotDateTime = screenshotDateTime;
  config.screenshotDateTime = screenshotDateTime;

  if (configJSON.dynamicTestId) {
    console.log(`dynamicTestId '${configJSON.dynamicTestId}' found. BackstopJS will run in dynamic-test mode.`);
  }

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

function saveViewportIndexes (viewport, index) {
  return Object.assign({}, viewport, { vIndex: index });
}

function delegateScenarios (config) {
  var scenarios = [];
  var scenarioViews = [];

  config.viewports = config.viewports.map(saveViewportIndexes);

  // casper.each(scenarios, function (casper, scenario, i) {
  config.scenarios.forEach(function (scenario, i) {
    // var scenarioLabelSafe = makeSafe(scenario.label);
    scenario.sIndex = i;
    scenario.selectors = scenario.selectors || [];
    if (scenario.viewports) {
      scenario.viewports = scenario.viewports.map(saveViewportIndexes);
    }
    scenarios.push(scenario);

    if (!config.isReference && scenario.hasOwnProperty('variants')) {
      scenario.variants.forEach(function (variant) {
        // var variantLabelSafe = makeSafe(variant.label);
        variant._parent = scenario;
        scenarios.push(scenario);
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

  if (config.engine.startsWith('puppet')) {
    return pMap(scenarioViews, runPuppet, { concurrency: asyncCaptureLimit });
  } else if (/chrom./i.test(config.engine)) {
    logger.error(`Chromy is no longer supported in version 5+. Please use version 4.x.x for chromy support.`);
  } else {
    logger.error(`Engine "${(typeof config.engine === 'string' && config.engine) || 'undefined'}" not recognized! If you require PhantomJS or Slimer support please use backstopjs@3.8.8 or earlier.`);
  }
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
  const promise = delegateScenarios(decorateConfigForCapture(config, isReference))
    .then(rawTestPairs => {
      const result = {
        compareConfig: {
          testPairs: flatMapTestPairs(rawTestPairs)
        }
      };
      return writeCompareConfigFile(config.tempCompareConfigFileName, result);
    });

  return promise;
};

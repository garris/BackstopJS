const cloneDeep = require('lodash/cloneDeep');
const fs = require('./fs');
const _ = require('lodash');
const pMap = require('p-map');

const { createPlaywrightBrowser, disposePlaywrightBrowser } = require('./runPlaywright');
const runCompareScenario = require('./runCompareScenario');

const ensureDirectoryPath = require('./ensureDirectoryPath');
const logger = require('./logger')('liveCompare');

const CONCURRENCY_DEFAULT = 10;

function regexTest (string, search) {
  const re = new RegExp(search);
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

function decorateConfigForCompare (config) {
  let configJSON;

  if (typeof config.args.config === 'object') {
    configJSON = cloneDeep(config.args.config);
  } else {
    configJSON = cloneDeep(require(config.backstopConfigFileName));
  }
  configJSON.scenarios = configJSON.scenarios || [];
  ensureViewportLabel(configJSON);

  const totalScenarioCount = configJSON.scenarios.length;

  function pad (number) {
    let r = String(number);
    if (r.length === 1) {
      r = '0' + r;
    }
    return r;
  }

  const screenshotNow = new Date();
  let screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());
  screenshotDateTime = configJSON.dynamicTestId ? configJSON.dynamicTestId : screenshotDateTime;
  configJSON.screenshotDateTime = screenshotDateTime;
  config.screenshotDateTime = screenshotDateTime;

  if (configJSON.dynamicTestId) {
    console.log('dynamicTestId \'' + configJSON.dynamicTestId + '\' found. BackstopJS will run in dynamic-test mode.');
  }

  configJSON.env = cloneDeep(config);
  configJSON.isReference = false;
  configJSON.isCompare = true;
  configJSON.paths = configJSON.paths || {};
  configJSON.paths.tempCompareConfigFileName = config.tempCompareConfigFileName;
  configJSON.defaultMisMatchThreshold = config.defaultMisMatchThreshold;
  configJSON.backstopConfigFileName = config.backstopConfigFileName;
  configJSON.defaultRequireSameDimensions = config.defaultRequireSameDimensions;

  // Pass through compare-specific config
  configJSON.compareRetries = config.compareRetries;
  configJSON.compareRetryDelay = config.compareRetryDelay;
  configJSON.maxNumDiffPixels = config.maxNumDiffPixels;

  if (config.args.filter) {
    const scenarios = [];
    config.args.filter.split(',').forEach(function (filteredTest) {
      configJSON.scenarios.forEach(function (scenario) {
        if (regexTest(scenario.label, filteredTest)) {
          scenarios.push(scenario);
        }
      });
    });
    configJSON.scenarios = scenarios;
  }

  // Validate that all scenarios have referenceUrl
  const missingReferenceUrl = configJSON.scenarios.filter(function (s) { return !s.referenceUrl; });
  if (missingReferenceUrl.length > 0) {
    const labels = missingReferenceUrl.map(function (s) { return '"' + s.label + '"'; }).join(', ');
    throw new Error('liveCompare requires referenceUrl for all scenarios. Missing on: ' + labels);
  }

  logger.log('Selected ' + configJSON.scenarios.length + ' of ' + totalScenarioCount + ' scenarios.');
  return configJSON;
}

function saveViewportIndexes (viewport, index) {
  return Object.assign({}, viewport, { vIndex: index });
}

function delegateCompareScenarios (config) {
  const scenarios = [];
  const scenarioViews = [];

  config.viewports = config.viewports.map(saveViewportIndexes);

  config.scenarios.forEach(function (scenario, i) {
    scenario.sIndex = i;
    scenario.selectors = scenario.selectors || [];
    if (scenario.viewports) {
      scenario.viewports = scenario.viewports.map(saveViewportIndexes);
    }
    scenarios.push(scenario);

    if (_.has(scenario, 'variants')) {
      scenario.variants.forEach(function (variant) {
        variant._parent = scenario;
        scenarios.push(variant);
      });
    }
  });

  let scenarioViewId = 0;
  scenarios.forEach(function (scenario) {
    let desiredViewportsForScenario = config.viewports;

    if (scenario.viewports && scenario.viewports.length > 0) {
      desiredViewportsForScenario = scenario.viewports;
    }

    desiredViewportsForScenario.forEach(function (viewport) {
      scenarioViews.push({
        scenario,
        viewport,
        config,
        id: scenarioViewId++
      });
    });
  });

  const asyncCaptureLimit = config.asyncCaptureLimit === 0 ? 1 : config.asyncCaptureLimit || CONCURRENCY_DEFAULT;

  if (config.engine.startsWith('puppet')) {
    return pMap(scenarioViews, runCompareScenario.puppet, { concurrency: asyncCaptureLimit });
  } else if (config.engine.startsWith('play')) {
    return new Promise(function (resolve, reject) {
      createPlaywrightBrowser(config).then(function (browser) {
        console.log('Browser created');

        for (let i = 0; i < scenarioViews.length; i++) {
          scenarioViews[i]._playwrightBrowser = browser;
        }

        pMap(scenarioViews, runCompareScenario.playwright, { concurrency: asyncCaptureLimit }).then(function (out) {
          disposePlaywrightBrowser(browser).then(function () { resolve(out); });
        }, function (e) {
          disposePlaywrightBrowser(browser).then(function () { reject(e); });
        });
      }, function (e) { reject(e); });
    });
  } else {
    const engineStr = (typeof config.engine === 'string' && config.engine) || 'undefined';
    logger.error('Engine "' + engineStr + '" not recognized!');
    return Promise.reject(new Error('Engine "' + engineStr + '" not recognized'));
  }
}

function writeCompareConfigFile (comparePairsFileName, compareConfig) {
  const compareConfigJSON = JSON.stringify(compareConfig, null, 2);
  ensureDirectoryPath(comparePairsFileName);
  return fs.writeFile(comparePairsFileName, compareConfigJSON);
}

function flatMapTestPairs (rawTestPairs) {
  return rawTestPairs.reduce(function (acc, result) {
    let testPairs = result.testPairs;
    if (!testPairs) {
      testPairs = {
        diff: {
          isSameDimensions: '',
          dimensionDifference: { width: '', height: '' },
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

module.exports = function (config) {
  const promise = delegateCompareScenarios(decorateConfigForCompare(config))
    .then(function (rawTestPairs) {
      const result = {
        compareConfig: {
          testPairs: flatMapTestPairs(rawTestPairs)
        }
      };
      return writeCompareConfigFile(config.tempCompareConfigFileName, result);
    });

  return promise;
};

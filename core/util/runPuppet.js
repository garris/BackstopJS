const puppeteer = require('puppeteer');
// const writeFileSync = require('fs').writeFileSync;
const fs = require('./fs');
const path = require('path');
const ensureDirectoryPath = require('./ensureDirectoryPath');

const MIN_CHROME_VERSION = 62;
const TEST_TIMEOUT = 30000;
const CHROMY_STARTING_PORT_NUMBER = 9222;
const DEFAULT_FILENAME_TEMPLATE = '{configId}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}';
const DEFAULT_BITMAPS_TEST_DIR = 'bitmaps_test';
const DEFAULT_BITMAPS_REFERENCE_DIR = 'bitmaps_reference';
const SELECTOR_NOT_FOUND_PATH = '/capture/resources/selectorNotFound_noun_164558_cc.png';
const HIDDEN_SELECTOR_PATH = '/capture/resources/hiddenSelector_noun_63405.png';
const BODY_SELECTOR = 'body';
const DOCUMENT_SELECTOR = 'document';
const NOCLIP_SELECTOR = 'body:noclip';
const VIEWPORT_SELECTOR = 'viewport';

const injectBackstopTools = require('../../capture/backstopTools.js');
const BackstopException = require('../util/BackstopException.js');

module.exports = function (args) {
  const scenario = args.scenario;
  const viewport = args.viewport;
  const config = args.config;
  const runId = args.id;
  const assignedPort = args.assignedPort;
  const scenarioLabelSafe = makeSafe(scenario.label);
  const variantOrScenarioLabelSafe = scenario._parent ? makeSafe(scenario._parent.label) : scenarioLabelSafe;

  return processScenarioView(scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, runId, assignedPort);
};

/**
 * [processScenarioView description]
 * @param  {[type]} scenario               [description]
 * @param  {[type]} variantOrScenarioLabelSafe [description]
 * @param  {[type]} scenarioLabelSafe          [description]
 * @param  {[type]} viewport               [description]
 * @param  {[type]} config                 [description]
 * @return {[type]}                        [description]
 */
async function processScenarioView (scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, runId) {
  if (!config.paths) {
    config.paths = {};
  }

  if (typeof viewport.label !== 'string') {
    viewport.label = viewport.name || '';
  }

  const engineScriptsPath = config.env.engine_scripts || config.env.casper_scripts || config.env.engine_scripts_default;
  const isReference = config.isReference;
  /**
   *  =============
   *  START CHROMY SESSION
   *  =============
   */
  const VP_W = viewport.width || viewport.viewport.width;
  const VP_H = viewport.height || viewport.viewport.height;

  const browser = await puppeteer.launch({ignoreHTTPSErrors: true});
  const page = await browser.newPage();

  page.setViewport({width: VP_W, height: VP_H})
  page.setDefaultNavigationTimeout(60000)
  /**
   * =================
   * CLI BEHAVIORS
   * =================
   */

  if (isReference) {
    console.log('CREATING NEW REFERENCE FILES');
  }

  /**
   *  =============
   *  TEST UTILS
   *  =============
   */

  // --- set up console output ---
  // chromy.console(function (text, consoleObj) {
  //   if (console[consoleObj.level]) {
  //     console[consoleObj.level](PORT + ' ' + (consoleObj.level).toUpperCase() + ' > ', text);
  //   }
  // });

  let chromeVersion = await page.evaluate(_ => {
    let v = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return v ? parseInt(v[2], 10) : 0;
  })

  if (chromeVersion < MIN_CHROME_VERSION) {
    console.warn(`***WARNING! CHROME VERSION ${MIN_CHROME_VERSION} OR GREATER IS REQUIRED. PLEASE UPDATE YOUR CHROME APP!***`);
  }

  /**
   *  =============
   *  IMPLEMENT TEST CONFIGS
   *  =============
   */

  // --- BEFORE SCRIPT ---
  /* ============
    onBeforeScript files should export a module like so:

    module.exports = function(renderer, scenario, vp) {
      // run custom renderer (casper or chromy) code
    };
  ============ */
  var onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
  if (onBeforeScript) {
    var beforeScriptPath = path.resolve(engineScriptsPath, onBeforeScript);
    if (fs.existsSync(beforeScriptPath)) {
      await require(beforeScriptPath)(page, scenario, viewport, isReference, browser);
    } else {
      console.warn('WARNING: script not found: ' + beforeScriptPath);
    }
  }

  //  --- OPEN URL ---
  var url = scenario.url;
  if (isReference && scenario.referenceUrl) {
    url = scenario.referenceUrl;
  }
  await page.goto(url);

  await injectBackstopTools(page);

  //  --- WAIT FOR READY EVENT ---
  var readyEvent = scenario.readyEvent || config.readyEvent;
  if (readyEvent) {
    await page
      .evaluate(`window._readyEvent = '${readyEvent}'`)
      // .wait(_ => {
//         return window._backstopTools.hasLogged(window._readyEvent);
//       })
      .evaluate(_ => console.info('readyEvent ok'));
  }

  // --- WAIT FOR SELECTOR ---
  if (scenario.readySelector) {
    await page.waitFor(scenario.readySelector);
  }
  //

  // --- DELAY ---
  // chromy.wait(scenario.delay || 0);


  // --- REMOVE SELECTORS ---
  // if (scenario.hasOwnProperty('removeSelectors')) {
  //   scenario.removeSelectors.forEach(function (selector) {
  //     page
  //     .evaluate(`window._backstopSelector = '${selector}'`)
  //     .evaluate(
  //       () => {
  //         Array.prototype.forEach.call(document.querySelectorAll(window._backstopSelector), function (s, j) {
  //           s.style.display = 'none';
  //           s.classList.add('__86d');
  //         });
  //       }
  //     );
  //   });
  // }

  //  --- ON READY SCRIPT ---
  /* ============
    onReadyScript files should export a module like so:

    module.exports = function(renderer, scenario, vp, isReference) {
      // run custom renderer (casper or chromy) code
    };
  ============ */
  var onReadyScript = scenario.onReadyScript || config.onReadyScript;
  if (onReadyScript) {
    var readyScriptPath = path.resolve(engineScriptsPath, onReadyScript);
    if (fs.existsSync(readyScriptPath)) {
      require(readyScriptPath)(page, scenario, viewport, isReference, browser);
    } else {
      console.warn(PORT, 'WARNING: script not found: ' + readyScriptPath);
    }
  }

  // reinstall tools in case onReadyScript has loaded a new URL.
  await injectBackstopTools(page);

  // --- HIDE SELECTORS ---
  // if (scenario.hasOwnProperty('hideSelectors')) {
  //   scenario.hideSelectors.forEach(function (selector) {
  //     page
  //     .evaluate(`window._backstopSelector = '${selector}'`)
  //     .evaluate(
  //       () => {
  //         Array.prototype.forEach.call(document.querySelectorAll(window._backstopSelector), function (s, j) {
  //           s.style.visibility = 'hidden';
  //         });
  //       }
  //     );
  //   });
  // }
  // CREATE SCREEN SHOTS AND TEST COMPARE CONFIGURATION (CONFIG FILE WILL BE SAVED WHEN THIS PROCESS RETURNS)
  // this.echo('Capturing screenshots for ' + makeSafe(vp.name) + ' (' + (vp.width || vp.viewport.width) + 'x' + (vp.height || vp.viewport.height) + ')', 'info');

  // --- HANDLE NO-SELECTORS ---
  if (!scenario.hasOwnProperty('selectors') || !scenario.selectors.length) {
    scenario.selectors = [DOCUMENT_SELECTOR];
  }

  await page.evaluate(`window._selectorExpansion = '${scenario.selectorExpansion}'`)
  await page.evaluate(`window._backstopSelectors = '${scenario.selectors}'`)
  let result = await page.evaluate(() => {
      if (window._selectorExpansion.toString() === 'true') {
        window._backstopSelectorsExp = window._backstopTools.expandSelectors(window._backstopSelectors);
      } else {
        window._backstopSelectorsExp = window._backstopSelectors;
      }
      if (!Array.isArray(window._backstopSelectorsExp)) {
        window._backstopSelectorsExp = window._backstopSelectorsExp.split(',');
      }
      window._backstopSelectorsExpMap = window._backstopSelectorsExp.reduce((acc, selector) => {
        acc[selector] = {
          exists: window._backstopTools.exists(selector),
          isVisible: window._backstopTools.isVisible(selector)
        };
        return acc;
      }, {});
      return {
        backstopSelectorsExp: window._backstopSelectorsExp,
        backstopSelectorsExpMap: window._backstopSelectorsExpMap
      };
    })

  // If an error occurred then resolve with an error.
  // .catch(e => {
  //   console.log(e);
  //   resolve(new BackstopException('Puppeteer error', scenario, viewport, e))
  // });

  return new Promise((resolve, reject) => {
    resolve(delegateSelectors(
      page,
      browser,
      scenario,
      viewport,
      variantOrScenarioLabelSafe,
      scenarioLabelSafe,
      config,
      result.backstopSelectorsExp,
      result.backstopSelectorsExpMap
    ));
  });
}

// vvv HELPERS vvv
/**
 * [delegateSelectors description]
 * @param  {[type]} chromy                     [description]
 * @param  {[type]} scenario                   [description]
 * @param  {[type]} viewport                   [description]
 * @param  {[type]} variantOrScenarioLabelSafe [description]
 * @param  {[type]} config                     [description]
 * @return {[type]}                            [description]
 */
function delegateSelectors (page, browser, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, config, selectors, selectorMap) {
  const fileNameTemplate = config.fileNameTemplate || DEFAULT_FILENAME_TEMPLATE;
  const configId = config.id || genHash(config.backstopConfigFileName);
  const bitmapsTestPath = config.paths.bitmaps_test || DEFAULT_BITMAPS_TEST_DIR;
  const bitmapsReferencePath = config.paths.bitmaps_reference || DEFAULT_BITMAPS_REFERENCE_DIR;
  const outputFileFormatSuffix = '.' + (config.outputFormat && config.outputFormat.match(/jpg|jpeg/) || 'png');

  let compareConfig = {testPairs: []};
  let captureDocument = false;
  let captureViewport = false;
  let captureList = [];
  let captureJobs = [];

  selectors.forEach(function (selector, i) {
    var cleanedSelectorName = selector.replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number
    var fileName = getFilename(fileNameTemplate, outputFileFormatSuffix, configId, scenario.sIndex, variantOrScenarioLabelSafe, i, cleanedSelectorName, viewport.vIndex, viewport.label);
    var referenceFilePath = bitmapsReferencePath + '/' + getFilename(fileNameTemplate, outputFileFormatSuffix, configId, scenario.sIndex, scenarioLabelSafe, i, cleanedSelectorName, viewport.vIndex, viewport.label);
    var testFilePath = bitmapsTestPath + '/' + config.screenshotDateTime + '/' + fileName;
    var filePath = config.isReference ? referenceFilePath : testFilePath;

    if (!config.isReference) {
      var requireSameDimensions;
      if (scenario.requireSameDimensions !== undefined) {
        requireSameDimensions = scenario.requireSameDimensions;
      } else if (config.requireSameDimensions !== undefined) {
        requireSameDimensions = config.requireSameDimensions;
      } else {
        requireSameDimensions = config.defaultRequireSameDimensions;
      }
      compareConfig.testPairs.push({
        reference: referenceFilePath,
        test: testFilePath,
        selector: selector,
        fileName: fileName,
        label: scenario.label,
        requireSameDimensions: requireSameDimensions,
        misMatchThreshold: getMisMatchThreshHold(scenario, config)
      });
    }

    selectorMap[selector].filePath = filePath;
    if (selector === BODY_SELECTOR || selector === DOCUMENT_SELECTOR) {
      captureDocument = selector;
    } else if (selector === VIEWPORT_SELECTOR) {
      captureViewport = selector;
    } else {
      captureList.push(selector);
    }
  });

  if (captureDocument) {
    captureJobs.push(function () { return captureScreenshot(page, browser, null, captureDocument, selectorMap, config, []); });
  }
  // TODO: push captureViewport into captureList (instead of calling captureScreenshot()) to improve perf.
  if (captureViewport) {
    captureJobs.push(function () { return captureScreenshot(page, browser, null, captureViewport, selectorMap, config, []); });
  }
  if (captureList.length) {
    captureJobs.push(function () { return captureScreenshot(page, browser, null, null, selectorMap, config, captureList); });
  }

  return new Promise(function (resolve, reject) {
    var job = null;
    var errors = [];
    var next = function () {
      if (captureJobs.length === 0) {
        if (errors.length === 0) {
          resolve();
        } else {
          reject(errors);
        }
        return;
      }
      job = captureJobs.shift();
      job.apply().catch(function (e) {
        console.log(e);
        errors.push(e);
      }).then(function () {
        next();
      });
    };
    next();
  }).then(function () {
    console.log('Close Browser');
    return browser.close();
  }).catch(function (err) {
    console.log(err);
    browser.close();
  }).then(_ => compareConfig);
}

/**
 * [captureScreenshot description]
 * @param  {[type]} chromy   [description]
 * @param  {[type]} filePath [description]
 * @param  {[type]} selector [description]
 * @param  {[type]} config   [description]
 * @return {[type]}          [description]
 */

// TODO: remove filepath_
async function captureScreenshot (page, browser, filePath_, selector, selectorMap, config, selectors) {
  ensureDirectoryPath(selectorMap[selector].filePath);
  await page
    .screenshot({path: selectorMap[selector].filePath});

  return new Promise (function (resolve, reject) {
    resolve();
    // VIEWPORT screenshot
    if (selector === VIEWPORT_SELECTOR || selector === BODY_SELECTOR) {

    // DOCUMENT screenshot
    } // else if (selector === NOCLIP_SELECTOR || selector === DOCUMENT_SELECTOR) {
//       chromy.screenshotMultipleSelectors(['body'], saveSelector);
//     // OTHER-SELECTOR screenshot
//     } else {
//       chromy.screenshotMultipleSelectors(selectors, saveSelector);
//     }


    // result helpers

    // saveViewport: selectors will be `body` or `viewport` ONLY
    // function saveViewport (buffer, selector) {
    //   const filePath = selectorMap[selector].filePath;
    //
    //   ensureDirectoryPath(filePath);
    //   return fs.writeFile(filePath, buffer);
    // }

    // saveSelector: selectorArr will contain any valid selector (not body or viewport).
    // If body *is* found in selector arr then it was originally DOCUMENT_SELECTOR -- and it will be reset back to DOCUMENT_SELECTOR -- this is because chromy takes a Document shot when BODY is used.
    // function saveSelector (err, buffer, index, selectorArr) {
    //   let selector = selectorArr[index];
    //   if (selector === BODY_SELECTOR) {
    //     selector = DOCUMENT_SELECTOR;
    //   }
    //   const selectorProps = selectorMap[selector];
    //   const filePath = selectorProps.filePath;
    //   if (!selectorProps.exists) {
    //     return fs.copy(config.env.backstop + SELECTOR_NOT_FOUND_PATH, filePath);
    //   } else if (!selectorProps.isVisible) {
    //     return fs.copy(config.env.backstop + HIDDEN_SELECTOR_PATH, filePath);
    //   } else {
    //     if (err) {
    //       console.log('ChromyJS returned an unexpected error while attempting to capture a selector.', err);
    //       return new Error(err);
    //     }
    //     ensureDirectoryPath(filePath);
    //     return fs.writeFile(filePath, buffer);
    //   }
    // }
  });
}

function getMisMatchThreshHold (scenario, config) {
  if (typeof scenario.misMatchThreshold !== 'undefined') { return scenario.misMatchThreshold; }
  if (typeof config.misMatchThreshold !== 'undefined') { return config.misMatchThreshold; }
  return config.defaultMisMatchThreshold;
}

function ensureFileSuffix (filename, suffix) {
  var re = new RegExp('\.' + suffix + '$', ''); // eslint-disable-line no-useless-escape
  return filename.replace(re, '') + '.' + suffix;
}

// merge both strings while soft-enforcing a single slash between them
function glueStringsWithSlash (stringA, stringB) {
  return stringA.replace(/\/$/, '') + '/' + stringB.replace(/^\//, '');
}

function genHash (str) {
  var hash = 0;
  var i;
  var chr;
  var len;
  if (!str) return hash;
  str = str.toString();
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  // return a string and replace a negative sign with a zero
  return hash.toString().replace(/^-/, 0);
}

function makeSafe (str) {
  return str.replace(/[ /]/g, '_');
}

function getFilename (fileNameTemplate, outputFileFormatSuffix, configId, scenarioIndex, scenarioLabelSafe, selectorIndex, selectorLabel, viewportIndex, viewportLabel) {
  var fileName = fileNameTemplate
    .replace(/\{configId\}/, configId)
    .replace(/\{scenarioIndex\}/, scenarioIndex)
    .replace(/\{scenarioLabel\}/, scenarioLabelSafe)
    .replace(/\{selectorIndex\}/, selectorIndex)
    .replace(/\{selectorLabel\}/, selectorLabel)
    .replace(/\{viewportIndex\}/, viewportIndex)
    .replace(/\{viewportLabel\}/, makeSafe(viewportLabel))
    .replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number or dash or underscore.

  var extRegExp = new RegExp(outputFileFormatSuffix + '$', 'i');
  if (!extRegExp.test(fileName)) {
    fileName = fileName + outputFileFormatSuffix;
  }
  return fileName;
}


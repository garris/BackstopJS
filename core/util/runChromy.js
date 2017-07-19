const Chromy = require('chromy');
const writeFileSync = require('fs').writeFileSync;
const fs = require('./fs');
const path = require('path');
const ensureDirectoryPath = require('./ensureDirectoryPath');

const TEST_TIMEOUT = 30000;
const CHROMY_STARTING_PORT_NUMBER = 9222;
const DEFAULT_FILENAME_TEMPLATE = '{configId}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}';
const DEFAULT_BITMAPS_TEST_DIR = 'bitmaps_test';
const DEFAULT_BITMAPS_REFERENCE_DIR = 'bitmaps_reference';
const BACKSTOP_TOOLS_PATH = '/capture/backstopTools.js';
const SELECTOR_NOT_FOUND_PATH = '/capture/resources/selectorNotFound_noun_164558_cc.png';
const HIDDEN_SELECTOR_PATH = '/capture/resources/hiddenSelector_noun_63405.png';
const BODY_SELECTOR = 'body';
const DOCUMENT_SELECTOR = 'document';
const NOCLIP_SELECTOR = 'body:noclip';

module.exports = function (args) {
  const scenario = args.scenario;
  const viewport = args.viewport;
  const config = args.config;
  const runId = args.id;
  const scenarioLabelSafe = makeSafe(scenario.label);
  const variantOrScenarioLabelSafe = scenario._parent ? makeSafe(scenario._parent.label) : scenarioLabelSafe;

  return processScenarioView(scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, runId);
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
function processScenarioView (scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, runId) {
  if (!config.paths) {
    config.paths = {};
  }
  const engineScriptsPath = config.env.engine_scripts || config.env.casper_scripts || config.env.engine_scripts_default;
  const isReference = config.isReference;

  /**
   *  =============
   *  START CHROMY SESSION
   *  =============
   */
  const w = viewport.width || viewport.viewport.width;
  const h = viewport.height || viewport.viewport.height;
  const flags = ['--ignore-certificate-errors', '--window-size={w},{h}'.replace(/{w}/, w).replace(/{h}/, h)];
  const port = CHROMY_STARTING_PORT_NUMBER + runId;

  console.log('Starting Chromy:', `port:${port}`, flags);
  let chromy = new Chromy({
    chromeFlags: flags,
    port: port,
    waitTimeout: TEST_TIMEOUT,
    visible: config.debugWindow || false
  }).chain();

  /**
   * =================
   * CLI BEHAVIORS
   * =================
   */

  if (isReference) {
    console.log('CREATING NEW REFERENCE FILES');
  }

  // // verbose console errors
  // if (config.debug) {
  //   console.log('Debug is enabled!');
  //   casper.on('page.error', function (msg, trace) {
  //     this.echo('Remote Error >    ' + msg, 'error');
  //     this.echo('file:     ' + trace[0].file, 'WARNING');
  //     this.echo('line:     ' + trace[0].line, 'WARNING');
  //     this.echo('function: ' + trace[0]['function'], 'WARNING');
  //   });
  // }

  // // verbose resource monitoring
  // casper.on('resource.received', function (resource) {
  //   var status = resource.status;
  //   if (status >= 400) {
  //     casper.log('remote error > ' + resource.url + ' failed to load (' + status + ')', 'error');
  //   }
  // });

  /**
   *  =============
   *  TEST UTILS
   *  =============
   */

  // --- set up console output ---
  chromy.console(function (text, consoleObj) {
    if (console[consoleObj.level]) {
      console[consoleObj.level](port + ' ' + (consoleObj.level).toUpperCase() + ' > ', text);
    }
  });

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
      require(beforeScriptPath)(chromy, scenario, viewport, isReference);
    } else {
      console.warn(port, ' WARNING: script not found: ' + beforeScriptPath);
    }
  }

  // // --- SIMPLE AUTH ---
  // if (casper.cli.options.user && casper.cli.options.password) {
  //   console.log('Auth User via CLI: ' + casper.cli.options.user);
  //   casper.setHttpAuth(casper.cli.options.user, casper.cli.options.password);
  // }

  //  --- OPEN URL ---
  var url = scenario.url;
  if (isReference && scenario.referenceUrl) {
    url = scenario.referenceUrl;
  }
  chromy.goto(url);

  // --- load in backstopTools into client app ---
  chromy.inject('js', config.env.backstop + BACKSTOP_TOOLS_PATH);

  //  --- WAIT FOR READY EVENT ---
  var readyEvent = scenario.readyEvent || config.readyEvent;
  if (readyEvent) {
    chromy
      .evaluate(`window._readyEvent = '${readyEvent}'`)
      .wait(_ => {
        return window._hasLogged(window._readyEvent);
      })
      .evaluate(_ => console.info('readyEvent ok'));
  }

  // --- WAIT FOR SELECTOR ---
  chromy.wait(scenario.readySelector || 0);

  // --- DELAY ---
  chromy.wait(scenario.delay || 0);

  //  --- OPTION DEBUG TO CONSOLE ---
  if (config.debug) {
    chromy
      .evaluate(_ => document.body.outerHTML)
      .result(htmlStr => console.log(port + 'SRC >', htmlStr));
  }

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
      chromy = require(readyScriptPath)(chromy, scenario, viewport, isReference) || chromy;
    } else {
      console.warn(port, 'WARNING: script not found: ' + readyScriptPath);
    }
  }

  // this.echo('Capturing screenshots for ' + makeSafe(vp.name) + ' (' + (vp.width || vp.viewport.width) + 'x' + (vp.height || vp.viewport.height) + ')', 'info');

  // --- HIDE SELECTORS ---
  if (scenario.hasOwnProperty('hideSelectors')) {
    scenario.hideSelectors.forEach(function (selector) {
      chromy
      .evaluate(`window._backstopSelector = '${selector}'`)
      .evaluate(
        () => {
          Array.prototype.forEach.call(document.querySelectorAll(window._backstopSelector), function (s, j) {
            s.style.visibility = 'hidden';
          });
        }
      );
    });
  }

  // --- REMOVE SELECTORS ---
  if (scenario.hasOwnProperty('removeSelectors')) {
    scenario.removeSelectors.forEach(function (selector) {
      chromy
      .evaluate(`window._backstopSelector = '${selector}'`)
      .evaluate(
        () => {
          Array.prototype.forEach.call(document.querySelectorAll(window._backstopSelector), function (s, j) {
            s.style.display = 'none';
            s.classList.add('__86d');
          });
        }
      );
    });
  }
  // CREATE SCREEN SHOTS AND TEST COMPARE CONFIGURATION (CONFIG FILE WILL BE SAVED WHEN THIS PROCESS RETURNS)

  // --- HANDLE NO-SELCTORS ---
  if (!scenario.hasOwnProperty('selectors') || !scenario.selectors.length) {
    scenario.selectors = [DOCUMENT_SELECTOR];
  }

  return new Promise((resolve, reject) => {
    if (scenario.selectorExpansion) {
      chromy
        .evaluate(`window._backstopSelectors = '${scenario.selectors}'`)
        .evaluate(() => window.expandSelectors(window._backstopSelectors))
        .result(_result => {
          scenario.selectorsExpanded = _result;
          resolve(delegateSelectors(
            chromy,
            scenario,
            viewport,
            variantOrScenarioLabelSafe,
            scenarioLabelSafe,
            config
          ));
        })
        .end();
    } else {
      scenario.selectorsExpanded = scenario.selectors;
      resolve(delegateSelectors(
        chromy,
        scenario,
        viewport,
        variantOrScenarioLabelSafe,
        scenarioLabelSafe,
        config
      ));
    }
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
function delegateSelectors (chromy, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, config) {
  const fileNameTemplate = config.fileNameTemplate || DEFAULT_FILENAME_TEMPLATE;
  const configId = config.id || genHash(config.backstopConfigFileName);
  var bitmapsTestPath = config.paths.bitmaps_test || DEFAULT_BITMAPS_TEST_DIR;
  var bitmapsReferencePath = config.paths.bitmaps_reference || DEFAULT_BITMAPS_REFERENCE_DIR;
  
  if (config.paths.bitmaps_reference) {
    bitmapsReferencePath = path.resolve(config.env.projectPath, config.paths.bitmaps_reference);
  }
  if (config.paths.bitmaps_test) {
    bitmapsTestPath = path.resolve(config.env.projectPath, config.paths.bitmaps_test);
  }
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log("bitmapsReferencePath: " + bitmapsReferencePath);
  console.log("bitmapsTestPath: " + bitmapsTestPath);
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  
  const outputFileFormatSuffix = '.' + (config.outputFormat && config.outputFormat.match(/jpg|jpeg/) || 'png');

  var compareConfig = {testPairs: []};
  var captureJobs = scenario.selectorsExpanded.map(function (selector, i) {
    var cleanedSelectorName = selector.replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number
    var fileName = getFilename(fileNameTemplate, outputFileFormatSuffix, configId, scenario.sIndex, variantOrScenarioLabelSafe, i, cleanedSelectorName, viewport.vIndex, viewport.name);
    var referenceFilePath = bitmapsReferencePath + '/' + getFilename(fileNameTemplate, outputFileFormatSuffix, configId, scenario.sIndex, scenarioLabelSafe, i, cleanedSelectorName, viewport.vIndex, viewport.name);
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
        misMatchThreshold: getMisMatchThreshHold(scenario)
      });
    }

    return function () {
      return captureScreenshot(chromy, filePath, selector, config);
    };
  });

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
        errors.push(e);
      }).then(function () {
        next();
      });
    };
    next();
  }).then(function () {
    return chromy.close().end();
  }).catch(function (err) {
    return chromy.close().end().then(function () {
      throw err;
    });
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
function captureScreenshot (chromy, filePath, selector, config) {
  return new Promise (function (resolve, reject) {
    let result = {
      exists: true,
      isVisible: true
    };

    if (selector === BODY_SELECTOR) {
      chromy
        .screenshot()
        .result(png => {
          return saveFile(png);
        });
    } else if (selector === NOCLIP_SELECTOR || selector === DOCUMENT_SELECTOR) {
      chromy.screenshotMultipleSelectors(['body'], saveFile);
    } else {
      chromy
        .evaluate(`window._backstopSelector = '${selector}'`)
        .evaluate(
          () => {
            return {
              exists: window.exists(window._backstopSelector),
              isVisible: window.isVisible(window._backstopSelector)
            };
          })
        .result(_result => {
          result = _result;
        })
        .screenshotMultipleSelectors([selector], saveFile);
    }

    chromy
      .end()
      .then(_ => {
        resolve();
      })
      .catch(e => {
        reject(e);
      });

    // result helper
    function saveFile () {
      const imgData = arguments.length > 1 ? arguments[1] : arguments[0];
      if (result.exists) {
        if (result.isVisible) {
          ensureDirectoryPath(filePath);
          return writeFileSync(filePath, imgData);
        } else {
          return fs.copy(config.env.backstop + HIDDEN_SELECTOR_PATH, filePath);
        }
      } else {
        return fs.copy(config.env.backstop + SELECTOR_NOT_FOUND_PATH, filePath);
      }
    }
  });
}

function getMisMatchThreshHold (scenario) {
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

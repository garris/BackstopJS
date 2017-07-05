const Chromy = require('chromy');
// const fs = require('fs');
var fs = require('./fs');

const path = require('path');
const ensureDirectoryPath = require('./ensureDirectoryPath');
const cwd = fs.workingDirectory;

const VISIBLE = true;
const TEST_TIMEOUT = 8000;
const CHROMY_PORT = 9222;

const BACKSTOP_TOOLS_PATH = '/capture/backstopTools.js';
const SELECTOR_NOT_FOUND_PATH = '/capture/resources/selectorNotFound_noun_164558_cc.png';
const HIDDEN_SELECTOR_PATH = '/capture/resources/hiddenSelector_noun_63405.png';
var BODY_SELECTOR = 'body';

module.exports = function (args) {

  var scenario = args.scenario;
  var viewport = args.viewport;
  var config = args.config;
  var runId = args.id;

  var scenarioLabelSafe = makeSafe(scenario.label);
  var variantOrScenarioLabelSafe = scenario._parent ? makeSafe(scenario._parent.label) : scenarioLabelSafe;
  var viewportNameSafe = makeSafe(viewport.name);

  return processScenarioView(scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, viewportNameSafe, config, runId);
};

/**
 * [processScenarioView description]
 * @param  {[type]} scenario               [description]
 * @param  {[type]} variantOrScenarioLabelSafe [description]
 * @param  {[type]} scenarioLabel          [description]
 * @param  {[type]} viewport               [description]
 * @param  {[type]} viewportNameSafe      [description]
 * @param  {[type]} config                 [description]
 * @return {[type]}                        [description]
 */
function processScenarioView (scenario, variantOrScenarioLabelSafe, scenarioLabel, viewport, viewportNameSafe, config, runId) {

  if (!config.paths) {
    config.paths = {};
  }

  var outputFormat = '.' + (config.outputFormat && config.outputFormat.match(/jpg|jpeg/) || 'png');
  var bitmapsReferencePath = config.paths.bitmaps_reference || 'bitmaps_reference';
  var bitmapsTestPath = config.paths.bitmaps_test || 'bitmaps_test';
  var casperScriptsPath = config.env.engine_scripts || config.env.casper_scripts || config.env.engine_scripts_default;
  // var comparePairsFileName = config.paths.tempCompareConfigFileName;
  var screenshotDateTime = config.screenshotDateTime;
  var configId = config.id || genHash(config.backstopConfigFileName);
  var fileNameTemplate = config.fileNameTemplate || '{configId}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}';

  var isReference = config.isReference;
  if (isReference) {
    console.log('CREATING NEW REFERENCE FILES');
  }

  if (!config.paths) {
    config.paths = {};
  }

  /**
   *  =============
   *  START CHROMY SESSION
   *  =============
   */
  const w = viewport.width || viewport.viewport.width;
  const h = viewport.height || viewport.viewport.height;
  const flags = ['--window-size={w},{h}'.replace(/{w}/, w).replace(/{h}/, h)];
  const port = CHROMY_PORT + runId;

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

  var isReference = config.isReference;
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

  // //  --- REFERENCE URL ---
  var url = scenario.url;
  if (isReference && scenario.referenceUrl) {
    url = scenario.referenceUrl;
  }

  // --- BEFORE SCRIPT ---
  /* ============
    onBeforeScript files should export a module like so:

    module.exports = function(renderer, scenario, vp) {
      // run custom renderer (casper or chromy) code
    };
  ============ */
  var onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
  if (onBeforeScript) {
    var beforeScriptPath = path.resolve(casperScriptsPath, onBeforeScript);
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
  chromy.goto(url);

  // --- load in backstopTools into client app ---
  chromy.inject('js', config.env.backstop + BACKSTOP_TOOLS_PATH);

  //  --- WAIT FOR READY EVENT ---
  var readyEvent = scenario.readyEvent || config.readyEvent;
  if (readyEvent) {
    chromy
      .evaluate(`_readyEvent = '${readyEvent}'`)
      .wait(_ => {
        return window._hasLogged(_readyEvent);
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
    var readyScriptPath = path.resolve(casperScriptsPath, onReadyScript);
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
    scenario.selectors = [BODY_SELECTOR];
  }

  // --- SELECTOR EXPANSION ---
  // if (scenario.selectorExpansion) {
  //   scenario.selectorsExpanded = scenario.selectors.reduce(function (acc, selector) {
  //     if (selector === BODY_SELECTOR) {
  //       return acc.concat([BODY_SELECTOR]);
  //     }

  //     var expandedSelector = casper.evaluate(function (selector) {
  //       return [].slice.call(document.querySelectorAll(selector)).map(function (element, expandedIndex) {
  //         var indexPartial = '__n' + expandedIndex;

  //         if (element.classList.contains('__86d')) {
  //           return '';
  //         }

  //         if (!expandedIndex) {
  //           // only first element is used for screenshots -- even if multiple instances exist.
  //           // therefore index 0 does not need extended qualification.
  //           return selector;
  //         }

  //         // update all matching selectors with additional indexPartial class
  //         element.classList.add(indexPartial);

  //         // return array of fully-qualified classnames
  //         return selector + '.' + indexPartial;
  //       });
  //     }, selector);

  //     // concat arrays of fully-qualified classnames
  //     return acc.concat(expandedSelector);
  //   }, []).filter(function (selector) {
  //     return selector !== '';
  //   });
  // } else {
    scenario.selectorsExpanded = scenario.selectors;
  // }

  // --- CAPTURE EACH SELECTOR + BUILD TEST CONFIG FILE ---
  var compareConfig = {testPairs: []};
  var captureJobs = scenario.selectorsExpanded.map(function (selector, i, a) {
    var cleanedSelectorName = selector.replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number
    var fileName = getFilename(fileNameTemplate, outputFormat, configId, scenario.sIndex, variantOrScenarioLabelSafe, i, cleanedSelectorName, viewport.vIndex, viewportNameSafe);
    var referenceFilePath = bitmapsReferencePath + '/' + getFilename(fileNameTemplate, outputFormat, configId, scenario.sIndex, scenarioLabel, i, cleanedSelectorName, viewport.vIndex, viewportNameSafe);
    var testFilePath = bitmapsTestPath + '/' + screenshotDateTime + '/' + fileName;
    var filePath = isReference ? referenceFilePath : testFilePath;

    if (!isReference) {
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
      return captureScreenshot(chromy, filePath, url, selector, config);
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

// vvv HELPERS vvv

function captureScreenshot (chromy, filePath, url, selector, config) {
  return new Promise (function (resolve, reject) {
    let result = {
      exists: true,
      isVisible: true
    };

    if (selector === BODY_SELECTOR) {
      chromy.screenshot();
    } else if (selector === 'body:noclip' || selector === 'document') {
      chromy.screenshotDocument();
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
        });

      chromy.screenshotSelector(selector);
    }

    chromy.result(png => {
      if (result.exists) {
        if (result.isVisible) {
          ensureDirectoryPath(filePath);
          return fs.writeFile(filePath, png, err => {
            if (err) {
              throw new Error('Error during file save. ', err);
            }
          });
        } else {
          return fs.copy(config.env.backstop + HIDDEN_SELECTOR_PATH, filePath);
        }
      } else {
        return fs.copy(config.env.backstop + SELECTOR_NOT_FOUND_PATH, filePath);
      }
    });

    chromy
      .end()
      .then(_ => {
        resolve();
      })
      .catch(e => {
        reject(e);
      });
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

function getFilename (fileNameTemplate, outputFormat, configId, scenarioIndex, scenarioLabel, selectorIndex, selectorLabel, viewportIndex, viewportLabel) {
  var fileName = fileNameTemplate
    .replace(/\{configId\}/, configId)
    .replace(/\{scenarioIndex\}/, scenarioIndex)
    .replace(/\{scenarioLabel\}/, scenarioLabel)
    .replace(/\{selectorIndex\}/, selectorIndex)
    .replace(/\{selectorLabel\}/, selectorLabel)
    .replace(/\{viewportIndex\}/, viewportIndex)
    .replace(/\{viewportLabel\}/, makeSafe(viewportLabel))
    .replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number or dash or underscore.

  var extRegExp = new RegExp(outputFormat + '$', 'i');
  if (!extRegExp.test(fileName)) {
    fileName = fileName + outputFormat;
  }
  return fileName;
}

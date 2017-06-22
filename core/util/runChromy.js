const Chromy = require('chromy');
const path = require('path');
const fs = require('fs');
const cwd = fs.workingDirectory;

const TEST_TIMEOUT = 20000;
const CHROMY_PORT = 9222;

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
  var DOCUMENT_SELECTOR = 'document';

  if (!config.paths) {
    config.paths = {};
  }

  var outputFormat = '.' + (config.outputFormat && config.outputFormat.match(/jpg|jpeg/) || 'png');
  var bitmapsReferencePath = config.paths.bitmaps_reference || 'bitmaps_reference';
  var bitmapsTestPath = config.paths.bitmaps_test || 'bitmaps_test';
  var casperScriptsPath = config.paths.casper_scripts || null;
  var comparePairsFileName = config.paths.tempCompareConfigFileName;
  var screenshotDateTime = config.screenshotDateTime;
  var configId = config.id || genHash(config.backstopConfigFileName);
  var fileNameTemplate = config.fileNameTemplate || '{configId}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}';

  var selectorNotFoundPath = config.env.backstop + '/capture/resources/selectorNotFound_noun_164558_cc.png';
  var hiddenSelectorPath = config.env.backstop + '/capture/resources/hiddenSelector_noun_63405.png';

  var isReference = config.isReference;
  if (isReference) {
    console.log('CREATING NEW REFERENCE FILES');
  }

  if (!config.paths) {
    config.paths = {};
  }
  var compareConfig = {testPairs: []};

  /**
   *  =============
   *  START CHROMY SESSION
   *  =============
   */
  const w = viewport.width || viewport.viewport.width;
  const h = viewport.height || viewport.viewport.height;
  const flags = ['--window-size={w},{h}'.replace(/{w}/, w).replace(/{h}/, h)];
  const port = CHROMY_PORT + runId;

  const chromy = new Chromy({
    chromeFlags: flags,
    port: port,
    visible: true
  }).chain();

  console.log('Starting Chromy:', `port:${port}`, flags);

  /**
   * =================
   * CLI BEHAVIORS
   * =================
   */

  // var isReference = config.isReference;
  // if (isReference) {
  //   console.log('CREATING NEW REFERENCE FILES');
  // }

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

  // TODO: REQUIRED!!!
  // // set up consoleBuffer
  var consoleBuffer = '';
  // casper.on('remote.message', function (message) {
  //   casper.echo(message);
  //   consoleBuffer = consoleBuffer + '\n' + message;
  // });

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

  // // --- BEFORE SCRIPT ---
  // /* ============
  //   onBeforeScript files should export a module like so:

  //   module.exports = function(casper, scenario, vp) {
  //     // run custom casperjs code
  //   };
  // ============ */
  // var onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
  // if (onBeforeScript) {
  //   require(getScriptPath(onBeforeScript))(casper, scenario, vp, isReference);
  // }

  // // --- SIMPLE AUTH ---
  // if (casper.cli.options.user && casper.cli.options.password) {
  //   console.log('Auth User via CLI: ' + casper.cli.options.user);
  //   casper.setHttpAuth(casper.cli.options.user, casper.cli.options.password);
  // }

  // //  --- OPEN URL + WAIT FOR READY EVENT + CONFIG DELAY ---
  // this.thenOpen(url, function () {
  //   casper.waitFor(
  //     function () { // test
  //       var readyEvent = scenario.readyEvent || config.readyEvent;
  //       if (!readyEvent) {
  //         return true;
  //       }
  //       var regExReadyFlag = new RegExp(readyEvent, 'i');
  //       return consoleBuffer.search(regExReadyFlag) > -1;
  //     },
  //     function () { // on done
  //       consoleBuffer = '';
  //       casper.echo('Ready event received.');
  //     },
  //     function () {
  //       casper.echo('Error while waiting for ready event.');
  //     }, // on timeout
  //     TEST_TIMEOUT
  //   );
  //   casper.wait(scenario.delay || 1);
  // });

  // //  --- OPTION DEBUG TO CONAOLE ---
  // casper.then(function () {
  //   if (config.debug) {
  //     var src = this.evaluate(function () {
  //       return document.body.outerHTML;
  //     });
  //     this.echo(src);
  //   }
  // });

  // //  --- ON READY SCRIPT ---
  // /* ============
  //   onReadyScript files should export a module like so:

  //   module.exports = function(casper, scenario, vp) {
  //     // run custom casperjs code
  //   };
  // ============ */
  // // Custom casperjs scripting after ready event + delay
  // casper.then(function () {
  //   var onReadyScript = scenario.onReadyScript || config.onReadyScript;
  //   if (onReadyScript) {
  //     require(getScriptPath(onReadyScript))(casper, scenario, vp, isReference);
  //   }
  // });

  // this.echo('Capturing screenshots for ' + makeSafe(vp.name) + ' (' + (vp.width || vp.viewport.width) + 'x' + (vp.height || vp.viewport.height) + ')', 'info');

  // // --- HIDE SELECTORS ---
  // if (scenario.hasOwnProperty('hideSelectors')) {
  //   scenario.hideSelectors.forEach(function (o, i, a) {
  //     casper.evaluate(function (o) {
  //       Array.prototype.forEach.call(document.querySelectorAll(o), function (s, j) {
  //         s.style.visibility = 'hidden';
  //       });
  //     }, o);
  //   });
  // }

  // // --- REMOVE SELECTORS ---
  // if (scenario.hasOwnProperty('removeSelectors')) {
  //   scenario.removeSelectors.forEach(function (o, i, a) {
  //     casper.evaluate(function (o) {
  //       Array.prototype.forEach.call(document.querySelectorAll(o), function (s, j) {
  //         s.style.display = 'none';
  //         s.classList.add('__86d');
  //       });
  //     }, o);
  //   });
  // }

  // CREATE SCREEN SHOTS AND TEST COMPARE CONFIGURATION (CONFIG FILE WILL BE SAVED WHEN THIS PROCESS RETURNS)

  // --- HANDLE NO-SELCTORS ---
  if (!scenario.hasOwnProperty('selectors') || !scenario.selectors.length) {
    scenario.selectors = [DOCUMENT_SELECTOR];
  }

  // --- SELECTOR EXPANSION ---
  // if (scenario.selectorExpansion) {
  //   scenario.selectorsExpanded = scenario.selectors.reduce(function (acc, selector) {
  //     if (selector === DOCUMENT_SELECTOR) {
  //       return acc.concat([DOCUMENT_SELECTOR]);
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

  var captureJobs = [];
  // --- CAPTURE EACH SELECTOR + BUILD TEST CONFIG FILE ---
  scenario.selectorsExpanded.forEach(function (o, i, a) {
    var cleanedSelectorName = o.replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number
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
        selector: o,
        fileName: fileName,
        label: scenario.label,
        requireSameDimensions: requireSameDimensions,
        misMatchThreshold: getMisMatchThreshHold(scenario)
      });
    }

    var result = captureScreenshot(chromy, filePath, o, url); // TODO:  do a .then() here!å
    captureJobs.push(result);

  });// END scenario.selectorsExpanded.forEach

  // =====================EARLY RETURN======================
  // return Promise.resolve(new Error('chromy does not yet do the thing'));
  return Promise.all(captureJobs)
          .then(_ => console.log('OK!'))
          .catch(err => console.log('boo.', err))
          // .then(_ => {
          //   chromy.end();
          // })
          .then(_ => {
            chromy.close();
          });
  // =====================EARLY RETURN======================
}

// vvv HELPERS vvv

function getMisMatchThreshHold (scenario) {
  if (typeof scenario.misMatchThreshold !== 'undefined') { return scenario.misMatchThreshold; }
  if (typeof config.misMatchThreshold !== 'undefined') { return config.misMatchThreshold; }
  return config.defaultMisMatchThreshold;
}

function captureScreenshot (chromy, filePath, selector, url) {
  console.log('saving >', filePath);
  ensureDirectoryPath(filePath);
  return new Promise (function (resolve, reject) {
    chromy
      .goto(url)
      .screenshotSelector(selector)
      .result((png) => {
        return fs.writeFile(filePath, png, err => {
          if (err) {
            console.log('BAD SAVE', err);
            return new Error(err);
          }
          console.log('GOOD SAVE');
        });
      })
      .end()
      .then(_ => {
        console.log('GOOD')
        resolve();
      })
      .catch(e => {
        console.log('BAD', e)
        reject();
      });
  });

  // if (selector === 'body:noclip' || selector === 'document') {
  //   casper.capture(filePath);
  // } else if (casper.exists(selector)) {
  //   if (casper.visible(selector)) {
  //     casper.captureSelector(filePath, selector);
  //   } else {
  //     fs.write(filePath, fs.read(hiddenSelectorPath, 'b'), 'b');
  //   }
  // } else {
  //   fs.write(filePath, fs.read(selectorNotFoundPath, 'b'), 'b');
  // }
}

// function complete () {
//   var compareConfigJSON = {compareConfig: compareConfig};
//   fs.write(comparePairsFileName, JSON.stringify(compareConfigJSON, null, 2), 'w');
//   console.log('Comparison config file updated.');
// }

function getScriptPath (scriptFilePath) {
  var scriptPath = ensureFileSuffix(scriptFilePath, 'js');

  if (casperScriptsPath) {
    scriptPath = glueStringsWithSlash(casperScriptsPath, scriptPath);
  }

  // make sure it's there...
  if (!fs.isFile(scriptPath)) {
    casper.echo(scriptPath + ' was not found.', 'ERROR');
    return;
  }

  return cwd + fs.separator + scriptPath;
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

function ensureDirectoryPath (filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryPath(dirname);
  fs.mkdirSync(dirname);
}


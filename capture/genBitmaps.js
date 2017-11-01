/* eslint-disable no-path-concat */
var DOCUMENT_SELECTOR = 'document';
var BODY_SELECTOR = 'body';
var VIEWPORT_SELECTOR = 'viewport';

var fs = require('fs');
var cwd = fs.workingDirectory;
var system = require('system');
var args = system.args;
var val, index, captureConfigFileName;
if (args.length !== 1) {
  args.forEach(function (arg, i) {
    arg = arg.split('--');
    if (arg[1]) {
      arg = arg[1].split('=');
      val = arg[1];
      index = arg[0];
      if (index === 'captureConfigFileName') {
        captureConfigFileName = val;
      }
    }
  });
}

var scriptName = fs.absolute(require('system').args[3]);
var __dirname = scriptName.substring(0, scriptName.lastIndexOf('/'));

var selectorNotFoundPath = __dirname + '/resources/selectorNotFound_noun_164558_cc.png';
var hiddenSelectorPath = __dirname + '/resources/hiddenSelector_noun_63405.png';
var genConfigPath = captureConfigFileName; // TODO :: find a way to use that directly from the main configuration

var config = require(genConfigPath);
if (!config.paths) {
  config.paths = {};
}

var outputFormat = '.' + (config.outputFormat && config.outputFormat.match(/jpg|jpeg/) || 'png');
var bitmapsReferencePath = config.paths.bitmaps_reference || 'bitmaps_reference';
var bitmapsTestPath = config.paths.bitmaps_test || 'bitmaps_test';
var casperScriptsPath = config.paths.engine_scripts || config.paths.casper_scripts || null;
var comparePairsFileName = config.paths.tempCompareConfigFileName;
var viewports = config.viewports;
var scenarios = config.scenarios || config.grabConfigs;
var configId = config.id || genHash(config.backstopConfigFileName);
var fileNameTemplate = config.fileNameTemplate || '{configId}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}';

var compareConfig = {testPairs: []};

var casper = require('casper').create({
  logLevel: config.debug ? 'debug' : 'info',
  verbose: config.debug
});

if (config.debug) {
  console.log('Debug is enabled!');

  casper.on('page.error', function (msg, trace) {
    this.echo('Remote Error >    ' + msg, 'error');
    this.echo('file:     ' + trace[0].file, 'WARNING');
    this.echo('line:     ' + trace[0].line, 'WARNING');
    this.echo('function: ' + trace[0]['function'], 'WARNING');
  });
}

casper.on('resource.received', function (resource) {
  var status = resource.status;
  if (status >= 400) {
    casper.log('remote error > ' + resource.url + ' failed to load (' + status + ')', 'error');
  }
});

var consoleBuffer = '';
casper.on('remote.message', function (message) {
  casper.echo(message);
  consoleBuffer = consoleBuffer + '\n' + message;
});

function capturePageSelectors (scenarios, viewports, bitmapsReferencePath, bitmapsTestPath, isReference) {
  var screenshotNow = new Date();
  var screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());

  casper.start();

  casper.each(scenarios, function (casper, scenario, i) {
    var scenarioLabelSafe = makeSafe(scenario.label);
    scenario.sIndex = i;

    processScenario(casper, scenario, scenarioLabelSafe, scenarioLabelSafe, viewports, bitmapsReferencePath, bitmapsTestPath, screenshotDateTime);

    if (!isReference && scenario.hasOwnProperty('variants')) {
      scenario.variants.forEach(function (variant) {
        var variantLabelSafe = makeSafe(variant.label);
        processScenario(casper, variant, variantLabelSafe, scenarioLabelSafe, viewports, bitmapsReferencePath, bitmapsTestPath, screenshotDateTime);
      });
    }
  });// end casper.each scenario
}

function getFilename (scenarioIndex, scenarioLabel, selectorIndex, selectorLabel, viewportIndex, viewportLabel) {
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

function processScenario (casper, scenario, scenarioOrVariantLabel, scenarioLabel, viewports, bitmapsReferencePath, bitmapsTestPath, screenshotDateTime) {
  var scriptTimeout = 20000;

  if (casper.cli.options.user && casper.cli.options.password) {
    console.log('Auth User via CLI: ' + casper.cli.options.user);
    casper.setHttpAuth(casper.cli.options.user, casper.cli.options.password);
  }

  casper.each(viewports, function (casper, vp, viewportIndex) {
    this.then(function () {
      var onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
      if (onBeforeScript) {
        require(getScriptPath(onBeforeScript))(casper, scenario, vp, isReference);
      }
      this.viewport(vp.width || vp.viewport.width, vp.height || vp.viewport.height);
    });

    var url = scenario.url;
    if (isReference && scenario.referenceUrl) {
      url = scenario.referenceUrl;
    }

    this.thenOpen(url, function () {
      casper.waitFor(
        function () { // test
          var readyEvent = scenario.readyEvent || config.readyEvent;
          if (!readyEvent) {
            return true;
          }
          var regExReadyFlag = new RegExp(readyEvent, 'i');
          return consoleBuffer.search(regExReadyFlag) > -1;
        },
        function () { // on done
          consoleBuffer = '';
          casper.echo('Ready event received.');
        },
        function () {
          casper.echo('Error while waiting for ready event.');
        }, // on timeout
        scriptTimeout
      );
    });

    casper.then(function () {
      if (scenario.readySelector) {
        casper.waitForSelector(
          scenario.readySelector,
          function () {
            casper.echo('readySelector found.');
          },
          function () {
            casper.echo('readySelector NOT found.');
          }
        );
      }
    });

    casper.wait(scenario.delay || 1);

    casper.then(function () {
      this.echo('Current location is ' + url, 'info');

      if (config.debug) {
        var src = this.evaluate(function () {
          return document.body.outerHTML;
        });
        this.echo(src);
      }
    });

    // Custom casperjs scripting after ready event and delay
    casper.then(function () {
      // onReadyScript files should export a module like so:
      //
      // module.exports = function(casper, scenario, vp) {
      //   // run custom casperjs code
      // };
      //
      var onReadyScript = scenario.onReadyScript || config.onReadyScript;
      if (onReadyScript) {
        require(getScriptPath(onReadyScript))(casper, scenario, vp, isReference);
      }
    });

    this.then(function () {
      this.echo('Capturing screenshots for ' + makeSafe(vp.label) + ' (' + (vp.width || vp.viewport.width) + 'x' + (vp.height || vp.viewport.height) + ')', 'info');

      // HIDE SELECTORS WE WANT TO AVOID
      if (scenario.hasOwnProperty('hideSelectors')) {
        scenario.hideSelectors.forEach(function (o, i, a) {
          casper.evaluate(function (o) {
            Array.prototype.forEach.call(document.querySelectorAll(o), function (s, j) {
              s.style.visibility = 'hidden';
            });
          }, o);
        });
      }

      // REMOVE UNWANTED SELECTORS FROM RENDER TREE
      if (scenario.hasOwnProperty('removeSelectors')) {
        scenario.removeSelectors.forEach(function (o, i, a) {
          casper.evaluate(function (o) {
            Array.prototype.forEach.call(document.querySelectorAll(o), function (s, j) {
              s.style.display = 'none';
              s.classList.add('__86d');
            });
          }, o);
        });
      }

      // CREATE SCREEN SHOTS AND TEST COMPARE CONFIGURATION (CONFIG FILE WILL BE SAVED WHEN THIS PROCESS RETURNS)
      // If no selectors are provided then set the default DOCUMENT_SELECTOR
      if (!scenario.hasOwnProperty('selectors') || !scenario.selectors.length) {
        scenario.selectors = [DOCUMENT_SELECTOR];
      }

      if (scenario.selectorExpansion) {
        scenario.selectorsExpanded = scenario.selectors.reduce(function (acc, selector) {
          if (selector === DOCUMENT_SELECTOR) {
            return acc.concat([DOCUMENT_SELECTOR]);
          }
          if (selector === BODY_SELECTOR || selector === VIEWPORT_SELECTOR) {
            return acc.concat([BODY_SELECTOR]);
          }

          var expandedSelector = casper.evaluate(function (selector) {
            return [].slice.call(document.querySelectorAll(selector)).map(function (element, expandedIndex) {
              var indexPartial = '__n' + expandedIndex;

              if (element.classList.contains('__86d')) {
                return '';
              }

              if (!expandedIndex) {
                // only first element is used for screenshots -- even if multiple instances exist.
                // therefore index 0 does not need extended qualification.
                return selector;
              }

              // update all matching selectors with additional indexPartial class
              element.classList.add(indexPartial);

              // return array of fully-qualified classnames
              return selector + '.' + indexPartial;
            });
          }, selector);

          // concat arrays of fully-qualified classnames
          return acc.concat(expandedSelector);
        }, []).filter(function (selector) {
          return selector !== '';
        });
      } else {
        scenario.selectorsExpanded = scenario.selectors;
      }

      scenario.selectorsExpanded.forEach(function (o, i, a) {
        var cleanedSelectorName = o.replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number

        var fileName = getFilename(scenario.sIndex, scenarioOrVariantLabel, i, cleanedSelectorName, viewportIndex, vp.label);

        var referenceFilePath = bitmapsReferencePath + '/' + getFilename(scenario.sIndex, scenarioLabel, i, cleanedSelectorName, viewportIndex, vp.label);
        var testFilePath = bitmapsTestPath + '/' + screenshotDateTime + '/' + fileName;

        var filePath = (isReference) ? referenceFilePath : testFilePath;

        captureScreenshot(casper, filePath, o, vp);

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
        // casper.echo('remote capture to > '+filePath,'info');
      });// end topLevelModules.forEach
    });
  });// end casper.each viewports
}

function getMisMatchThreshHold (scenario) {
  if (typeof scenario.misMatchThreshold !== 'undefined') { return scenario.misMatchThreshold; }

  if (typeof config.misMatchThreshold !== 'undefined') { return config.misMatchThreshold; }

  return config.defaultMisMatchThreshold;
}

function captureScreenshot (casper, filePath, selector, vp) {
  if (selector === 'body:noclip' || selector === 'document') {
    casper.capture(filePath);
  } else if (selector === 'body') {
    casper.capture(filePath, {
      top: 0,
      left: 0,
      width: vp.width || vp.viewport.width,
      height: vp.height || vp.viewport.height
    });
  } else if (casper.exists(selector)) {
    if (casper.visible(selector)) {
      casper.captureSelector(filePath, selector);
    } else {
      fs.write(filePath, fs.read(hiddenSelectorPath, 'b'), 'b');
    }
  } else {
    fs.write(filePath, fs.read(selectorNotFoundPath, 'b'), 'b');
  }
}

var isReference = config.isReference;
if (isReference) {
  console.log('CREATING NEW REFERENCE FILES');
}

capturePageSelectors(scenarios, viewports, bitmapsReferencePath, bitmapsTestPath, isReference);

casper.run(function () {
  complete();
  this.exit();
});

function complete () {
  var compareConfigJSON = {compareConfig: compareConfig};
  fs.write(comparePairsFileName, JSON.stringify(compareConfigJSON, null, 2), 'w');
  console.log('Comparison config file updated.');
}

function pad (number) {
  var r = String(number);
  if (r.length === 1) {
    r = '0' + r;
  }
  return r;
}

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
  return str && str.replace(/[ /]/g, '_') || '';
}

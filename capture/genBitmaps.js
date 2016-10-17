/* eslint-disable no-path-concat */

var fs = require('fs');
var cwd = fs.workingDirectory;
var scriptName = fs.absolute(require('system').args[3]);
var __dirname = scriptName.substring(0, scriptName.lastIndexOf('/'));

var selectorNotFoundPath = __dirname + '/resources/selectorNotFound_noun_164558_cc.png';
var hiddenSelectorPath = __dirname + '/resources/hiddenSelector_noun_63405.png';
var genConfigPath = __dirname + '/config.json'; // TODO :: find a way to use that directly from the main configuration

var config = require(genConfigPath);
if (!config.paths) {
  config.paths = {};
}

var bitmapsReferencePath = config.paths.bitmaps_reference || 'bitmaps_reference';
var bitmapsTestPath = config.paths.bitmaps_test || 'bitmaps_test';
var casperScriptsPath = config.paths.casper_scripts || null;
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

function processScenario (casper, scenario, scenarioOrVariantLabel, scenarioLabel, viewports, bitmapsReferencePath, bitmapsTestPath, screenshotDateTime) {
  var scriptTimeout = 20000;

  casper.each(viewports, function (casper, vp, viewportIndex) {
    this.then(function () {
      this.viewport(vp.width || vp.viewport.width, vp.height || vp.viewport.height);
    });

    var url = scenario.url;
    if (isReference && scenario.referenceUrl) {
      url = scenario.referenceUrl;
    }

    var onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
    if (onBeforeScript) {
      require(getScriptPath(onBeforeScript))(casper, scenario, vp, isReference);
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
      casper.wait(scenario.delay || 1);
    });

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
      this.echo('Capturing screenshots for ' + makeSafe(vp.name) + ' (' + (vp.width || vp.viewport.width) + 'x' + (vp.height || vp.viewport.height) + ')', 'info');

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
            });
          }, o);
        });
      }

      // CREATE SCREEN SHOTS AND TEST COMPARE CONFIGURATION (CONFIG FILE WILL BE SAVED WHEN THIS PROCESS RETURNS)
      // If no selectors are provided then set the default 'body'
      if (!scenario.hasOwnProperty('selectors') || !scenario.selectors.length) {
        scenario.selectors = ['document'];
      }
      scenario.selectors.forEach(function (o, i, a) {
        var cleanedSelectorName = o.replace(/[^a-z0-9_\-]/gi, ''); // remove anything that's not a letter or a number
        var switchedScenarioOrVariantLabel = (isReference) ? scenarioLabel : scenarioOrVariantLabel;

        var fileName = fileNameTemplate
          .replace(/\{configId\}/, configId)
          .replace(/\{scenarioIndex\}/, scenario.sIndex)
          .replace(/\{scenarioLabel\}/, switchedScenarioOrVariantLabel) // derrived from scenario.label & variant.label
          .replace(/\{selectorIndex\}/, i)
          .replace(/\{selectorLabel\}/, cleanedSelectorName)
          .replace(/\{viewportIndex\}/, viewportIndex)
          .replace(/\{viewportLabel\}/, makeSafe(vp.name))
          .replace(/[^a-z0-9_\-]/gi, ''); // remove anything that's not a letter or a number or dash or underscore.

        if (!/\.png$/i.test(fileName)) {
          fileName = fileName + '.png';
        }

        var referenceFilePath = bitmapsReferencePath + '/' + fileName;
        var testFilePath = bitmapsTestPath + '/' + screenshotDateTime + '/' + fileName;

        var filePath = (isReference) ? referenceFilePath : testFilePath;

        captureScreenshot(casper, filePath, o);

        if (!isReference) {
          compareConfig.testPairs.push({
            reference: referenceFilePath,
            test: testFilePath,
            selector: o,
            fileName: fileName,
            label: scenario.label,
            misMatchThreshold: scenario.misMatchThreshold || config.misMatchThreshold || config.defaultMisMatchThreshold
          });
        }
        // casper.echo('remote capture to > '+filePath,'info');
      });// end topLevelModules.forEach
    });
  });// end casper.each viewports
}

function captureScreenshot (casper, filePath, selector) {
  if (selector === 'body:noclip' || selector === 'document') {
    casper.capture(filePath);
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
  var hash = 0, i, chr, len;
  if (!str) return hash;
  str = str.toString();
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  // return a string and replace a negative sign with a zero
  return hash.toString().replace(/^-/,0);
}

function makeSafe (str) {
  return str.replace(/[ \/]/g, '_');
}

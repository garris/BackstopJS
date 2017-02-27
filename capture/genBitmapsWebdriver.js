"use strict";

/* eslint-disable no-path-concat */
const DOCUMENT_SELECTOR = 'document';
const fs = require('fs');
const path = require('path');
const cwd = fs.workingDirectory;
const exec = require('child_process').exec;

const args = process.argv;

// var scriptName = __filename; //fs.absolute(require('system').args[3]);
//  __dirname = __dirname; //scriptName.substring(0, scriptName.lastIndexOf('/'));

// var selectorNotFoundPath = __dirname + '/resources/selectorNotFound_noun_164558_cc.png';
// var hiddenSelectorPath = __dirname + '/resources/hiddenSelector_noun_63405.png';
var genConfigPath = args[2]; //__dirname + "/../config.json"; // TODO :: find a way to use that directly from the main configuration

const config = require(genConfigPath);
if (!config.paths) {
    config.paths = {};
}

// console.log("config", config)

const isReference = config.isReference;
if (isReference) {
    console.log('CREATING NEW REFERENCE FILES');
}

var outputFormat = "." + (config.outputFormat && config.outputFormat.match(/jpg|jpeg/) || 'png');
var bitmapsReferencePath = config.paths.bitmaps_reference || 'bitmaps_reference';
var bitmapsTestPath = config.paths.bitmaps_test || 'bitmaps_test';
var casperScriptsPath = config.paths.casper_scripts || null;
var comparePairsFileName = config.paths.tempCompareConfigFileName;
// var viewports = config.viewports;
const scenarios = config.scenarios || config.grabConfigs;
const configId = config.id || genHash(config.backstopConfigFileName);
var fileNameTemplate = config.fileNameTemplate || '{configId}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}';

const compareConfig = {testPairs: []};

const browser = require("webdriverio");
const client = browser.remote({
    browserName: 'chrome'
});

var wdioElementScreenshot = require('wdio-element-screenshot');
wdioElementScreenshot.init(client);

client.init()
  .url(scenarios[0].url)
  .then(capturePageSelectors);

function capturePageSelectors() {
    var screenshotNow = new Date();
    var screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());
    
    setTimeout(function () {
        config.scenarios.forEach(function (scenario, i) {
            var scenarioLabelSafe = makeSafe(scenario.label);
            scenario.sIndex = i;
            
            processScenario(scenario, scenarioLabelSafe, screenshotDateTime);
        });
    }, 1000);
}

function processScenario(scenario, scenarioLabel, screenshotDateTime) {
    config.viewports.forEach(function (vp, viewportIndex) {
        
        console.log('Capturing screenshots for ' + makeSafe(vp.name) + ' (' + (vp.width || vp.viewport.width) + 'x' + (vp.height || vp.viewport.height) + ')', 'info');
        
        let l = scenario.selectors.length;
        let counter = 0;
        
        scenario.selectors.forEach(function (selector, i) {
            let cleanedSelectorName = selector.replace(/[^a-z0-9_\-]/gi, ''); // remove anything that's not a letter or a number
            
            let fileName = fileNameTemplate
              .replace(/\{configId\}/, configId)
              .replace(/\{scenarioIndex\}/, scenario.sIndex)
              .replace(/\{scenarioLabel\}/, scenarioLabel) // derrived from scenario.label & variant.label
              .replace(/\{selectorIndex\}/, i)
              .replace(/\{selectorLabel\}/, cleanedSelectorName)
              .replace(/\{viewportIndex\}/, viewportIndex)
              .replace(/\{viewportLabel\}/, makeSafe(vp.name))
              .replace(/[^a-z0-9_\-]/gi, ''); // remove anything that's not a letter or a number or dash or underscore.
            
            let extRegExp = new RegExp(outputFormat + '$', 'i');
            if (!extRegExp.test(fileName)) {
                fileName = fileName + outputFormat;
            }
            
            let referenceFilePath = bitmapsReferencePath + '/' + fileName;
            let testFilePath = bitmapsTestPath + '/' + screenshotDateTime + '/' + fileName;
            
            const filePath = (isReference) ? referenceFilePath : testFilePath;
            
            let finalDirName = path.dirname(__dirname + "/../../../" + filePath);
            
            exec("mkdir -p " + finalDirName, function () {
                if (!isReference) {
                    compareConfig.testPairs.push({
                        reference        : referenceFilePath,
                        test             : testFilePath,
                        selector         : selector,
                        fileName         : fileName,
                        label            : scenario.label,
                        misMatchThreshold: scenario.misMatchThreshold || config.misMatchThreshold || config.defaultMisMatchThreshold
                    });
                    
                }
                
                console.log("saving screenshot at", selector, path.resolve(__dirname + "/../../../" + filePath));
                
                client.saveElementScreenshot(selector, path.resolve(__dirname + "/../../../" + filePath))
                  .then(function () {
                      counter++;
                      console.log("counter >= l", counter, l)
                      if (counter >= l) {
                          client.end();
                          complete();
                          setTimeout(function () {
                              console.log("finished all screenshots");
                              process.exit();
                          }, 500);
                      }
                  });
                
            });
            
            
            // casper.echo('remote capture to > '+filePath,'info');
        });// end topLevelModules.forEach
    });
}

function complete() {
    // console.log("comparePairsFileName", comparePairsFileName)
    var compareConfigJSON = {compareConfig: compareConfig};
    fs.writeFileSync(comparePairsFileName, JSON.stringify(compareConfigJSON, null, 2));
    console.log('Comparison config file updated.');
}

function pad(number) {
    var r = String(number);
    if (r.length === 1) {
        r = '0' + r;
    }
    return r;
}

function genHash(str) {
    var hash = 0, i, chr, len;
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

function makeSafe(str) {
    return str.replace(/[ \/]/g, '_');
}

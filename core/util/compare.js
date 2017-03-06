var resemble = require('node-resemble-js');
var path = require('path');
var map = require('p-map');

var fs = require('fs');
var streamToPromise = require('./streamToPromise');
var Reporter = require('./Reporter');
var logger = require('./logger')('compare');

var ASYNC_COMPARE_LIMIT = 20;

function storeFailedDiffImage (testPath, data) {
  var failedDiffFilename = getFailedDiffFilename(testPath);
  console.log('   See:', failedDiffFilename);

  var failedDiffStream = fs.createWriteStream(failedDiffFilename);
  var ext = failedDiffFilename.substring(failedDiffFilename.lastIndexOf('.') + 1);

  if (ext === 'png') {
    var storageStream = data.getDiffImage()
        .pack()
        .pipe(failedDiffStream);
    return streamToPromise(storageStream, failedDiffFilename);
  }

  if (ext === 'jpg' || ext === 'jpeg') {
    fs.writeFileSync(failedDiffFilename, data.getDiffImageAsJPEG(85));
    return Promise.resolve(failedDiffFilename);
  }
}

function getFailedDiffFilename (testPath) {
  var lastSlash = testPath.lastIndexOf(path.sep);
  return testPath.slice(0, lastSlash + 1) + 'failed_diff_' + testPath.slice(lastSlash + 1, testPath.length);
}

function compareImage (referencePath, testPath, resembleOutputSettings) {
  return new Promise(function (resolve, reject) {
    if (!fs.existsSync(referencePath)) {
      // Returning the error as a "resolve" so all errors can be caught instead of just the first one
      return resolve(new Error('Reference image not found: ' + referencePath));
    }

    if (!fs.existsSync(testPath)) {
      // Returning the error as a "resolve" so all errors can be caught instead of just the first one
      return resolve(new Error('Test image not found: ' + testPath));
    }

    resemble.outputSettings(resembleOutputSettings || {});
    resemble(referencePath).compareTo(testPath).onComplete(resolve);
  });
}

module.exports = function (config) {
  var compareConfig = require(config.tempCompareConfigFileName).compareConfig;

  var report = new Reporter(config.ciReport.testSuiteName);

  return map(compareConfig.testPairs, function (pair) {
    var Test = report.addTest(pair);

    var referencePath = path.join(config.projectPath, pair.reference);
    var testPath = path.join(config.projectPath, pair.test);

    return compareImage(referencePath, testPath, config.resembleOutputOptions)
      .then(function logCompareResult (data) {
        pair.diff = data;

        if (data.isSameDimensions && data.misMatchPercentage <= pair.misMatchThreshold) {
          Test.status = 'pass';
          logger.success('OK: ' + pair.label + ' ' + pair.fileName);
          data = null;
          pair.diff.getDiffImage = null;

          return pair;
        }

        Test.status = 'fail';
        if (data instanceof Error) {
          logger.error('ERROR ' + data.message + ': ' + pair.label + ' ' + pair.fileName);
          pair.error = data;
          return pair;
        } else {
          logger.error('ERROR { size: ' + (data.isSameDimensions ? 'ok' : 'isDifferent') + ', content: ' + data.misMatchPercentage + '%, threshold: ' + pair.misMatchThreshold + '% }: ' + pair.label + ' ' + pair.fileName);
        }

        return storeFailedDiffImage(testPath, data).then(function (compare) {
          pair.diffImage = compare;
          data = null;
          pair.diff.getDiffImage = null;

          return pair;
        });
      });
  }, { concurrency: config.asyncCompareLimit || ASYNC_COMPARE_LIMIT }).then(function () {
    return report;
  }, function (e) {
    logger.error('The comparison failed with error: ' + e);
  });
};

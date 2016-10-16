var resemble = require('node-resemble-js');
var path = require('path');
var map = require('lodash.map');

var fs = require('./fs');
var streamToPromise = require('./streamToPromise');
var Reporter = require('./Reporter');
var logger = require('./logger')('compare');

function storeFailedDiffImage (testPath, data) {
  var failedDiffFilename = getFailedDiffFilename(testPath);
  console.log('   See:', failedDiffFilename);

  var failedDiffStream = fs.createWriteStream(failedDiffFilename);
  var storageStream = data.getDiffImage()
    .pack()
    .pipe(failedDiffStream);

  return streamToPromise(storageStream, failedDiffFilename);
}

function getFailedDiffFilename (testPath) {
  var lastSlash = testPath.lastIndexOf(path.sep);
  return testPath.slice(0, lastSlash + 1) + 'failed_diff_' + testPath.slice(lastSlash + 1, testPath.length);
}

function compareImage (referencePath, testPath) {
  return new Promise(function (resolve, reject) {
    if (!fs.existsSync(referencePath)) {
      reject('Reference image not found: ' + referencePath);
    }

    if (!fs.existsSync(testPath)) {
      reject('Test image not found: ' + testPath);
    }

    resemble(referencePath).compareTo(testPath)
      .onComplete(function (data) {
        resolve(data);
      });
  });
}

module.exports = function (config) {
  var compareConfig = require(config.tempCompareConfigFileName).compareConfig;

  var report = new Reporter(config.ciReport.testSuiteName);

  var tests = map(compareConfig.testPairs, function (pair) {
    var Test = report.addTest(pair);

    var referencePath = path.join(config.customBackstop, pair.reference);
    var testPath = path.join(config.customBackstop, pair.test);

    return compareImage(referencePath, testPath)
      .then(function logCompareResult (data) {
        pair.diff = data;

        if (data.isSameDimensions && data.misMatchPercentage <= pair.misMatchThreshold) {
          Test.status = 'pass';
          logger.success('OK: ' + pair.label + ' ' + pair.fileName);

          return pair;
        }

        Test.status = 'fail';
        logger.error('ERROR { size: ' + (data.isSameDimensions ? 'ok' : 'isDifferent') + ', content: ' + data.misMatchPercentage + '%, threshold: ' + pair.misMatchThreshold + '% }: ' + pair.label + ' ' + pair.fileName);

        return storeFailedDiffImage(testPath, data).then(function (compare) {
          pair.diffImage = compare;

          return pair;
        });
      });
  });

  return Promise.all(tests).then(function () {
    return report;
  });
};

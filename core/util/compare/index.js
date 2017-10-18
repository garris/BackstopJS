var path = require('path');
var map = require('p-map');
var fs = require('fs');

var compare = require('./compare');
var Reporter = require('./../Reporter');
var logger = require('./../logger')('compare');
var storeFailedDiff = require('./store-failed-diff.js');
var storeFailedDiffStub = require('./store-failed-diff-stub.js');

var ASYNC_COMPARE_LIMIT = 20;

function comparePair (pair, report, config) {
  var Test = report.addTest(pair);

  var referencePath = pair.reference ? path.resolve(config.projectPath, pair.reference) : '';
  var testPath = pair.test ? path.resolve(config.projectPath, pair.test) : '';

  // TEST RUN ERROR/EXCEPTION
  if (!referencePath || !testPath) {
    var MSG = `${pair.msg}: ${pair.error}. See scenario – ${pair.scenario.label} (${pair.viewport.label})`;
    Test.status = 'fail';
    logger.error(MSG);
    pair.error = MSG;
    return Promise.resolve(pair);
  }

  // REFERENCE NOT FOUND ERROR
  if (!fs.existsSync(referencePath)) {
    // save a failed image stub
    storeFailedDiffStub(testPath);

    Test.status = 'fail';
    logger.error('Reference image not found ' + pair.fileName);
    pair.error = 'Reference file not found ' + referencePath;
    return Promise.resolve(pair);
  }

  if (!fs.existsSync(testPath)) {
    Test.status = 'fail';
    logger.error('Test image not found ' + pair.fileName);
    pair.error = 'Test file not found ' + testPath;
    return Promise.resolve(pair);
  }

  var resembleOutputSettings = config.resembleOutputOptions;
  return compareImages(referencePath, testPath, pair, resembleOutputSettings, Test);
}

function compareImages (referencePath, testPath, pair, resembleOutputSettings, Test) {
  return compare(referencePath, testPath, pair.misMatchThreshold, resembleOutputSettings, pair.requireSameDimensions)
    .then(function (data) {
      pair.diff = data;
      Test.status = 'pass';
      logger.success('OK: ' + pair.label + ' ' + pair.fileName);
      data = null;
      pair.diff.getDiffImage = null;
      return pair;
    })
    .catch(function (data) {
      pair.diff = data;
      Test.status = 'fail';
      logger.error('ERROR { requireSameDimensions: ' + (data.requireSameDimensions ? 'true' : 'false') + ' size: ' + (data.isSameDimensions ? 'ok' : 'isDifferent') + ', content: ' + data.misMatchPercentage + '%, threshold: ' + pair.misMatchThreshold + '% }: ' + pair.label + ' ' + pair.fileName);

      return storeFailedDiff(testPath, data).then(function (compare) {
        pair.diffImage = compare;
        data = null;
        pair.diff.getDiffImage = null;
        return pair;
      });
    });
}

module.exports = function (config) {
  var compareConfig = require(config.tempCompareConfigFileName).compareConfig;
  var report = new Reporter(config.ciReport.testSuiteName);
  var asyncCompareLimit = config.asyncCompareLimit || ASYNC_COMPARE_LIMIT;

  return map(compareConfig.testPairs, pair => comparePair(pair, report, config), {concurrency: asyncCompareLimit})
    .then(
      () => report,
      e => logger.error('The comparison failed with error: ' + e)
    );
};

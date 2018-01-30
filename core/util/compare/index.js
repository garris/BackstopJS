var path = require('path');
var map = require('p-map');
var fs = require('fs');
var cp = require('child_process');

var Reporter = require('./../Reporter');
var logger = require('./../logger')('compare');
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
  return new Promise(function (resolve, reject) {
    var worker = cp.fork(require.resolve('./compare'));
    worker.send({
      referencePath          : referencePath,
      testPath               : testPath,
      resembleOutputSettings : resembleOutputSettings,
      pair                   : pair
    });

    worker.on('message', function (data) {
      worker.kill();
      Test.status = data.status;
      pair.diff = data.diff;

      if (data.status == 'fail') {
        pair.diffImage = data.diffImage;
        logger.error('ERROR { requireSameDimensions: ' + (data.requireSameDimensions ? 'true' : 'false') + ', size: ' + (data.isSameDimensions ? 'ok' : 'isDifferent') + ', content: ' + data.diff.misMatchPercentage + '%, threshold: ' + pair.misMatchThreshold + '% }: ' + pair.label + ' ' + pair.fileName);
      } else {
        logger.success('OK: ' + pair.label + ' ' + pair.fileName);
      }

      resolve(data);
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

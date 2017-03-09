var compareResemble = require('./compare-resemble');
var path = require('path');
var map = require('p-map');

var fs = require('fs');
var Reporter = require('./../Reporter');
var logger = require('./../logger')('compare');
var storeFailedDiff = require('./store-failed-diff.js');

var ASYNC_COMPARE_LIMIT = 20;

module.exports = function (config) {
  var compareConfig = require(config.tempCompareConfigFileName).compareConfig;

  var report = new Reporter(config.ciReport.testSuiteName);

  return map(compareConfig.testPairs, function (pair) {
    var Test = report.addTest(pair);

    var referencePath = path.join(config.projectPath, pair.reference);
    var testPath = path.join(config.projectPath, pair.test);

    if (!fs.existsSync(referencePath)) {
      Test.status = 'fail';
      logger.error('ERROR reference image not found' + referencePath + ': ' + pair.label + ' ' + pair.fileName);
      pair.error = 'Reference file not found' + referencePath;
      return Promise.resolve(pair);
    }

    if (!fs.existsSync(testPath)) {
      Test.status = 'fail';
      logger.error('ERROR test image not found' + testPath + ': ' + pair.label + ' ' + pair.fileName);
      pair.error = 'Reference file not found' + testPath;
      return Promise.resolve(pair);
    }


    return compareResemble(referencePath, testPath, pair.misMatchThreshold, config.resembleOutputOptions)
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
        logger.error('ERROR { size: ' + (data.isSameDimensions ? 'ok' : 'isDifferent') + ', content: ' + data.misMatchPercentage + '%, threshold: ' + pair.misMatchThreshold + '% }: ' + pair.label + ' ' + pair.fileName);

        return storeFailedDiff(testPath, data).then(function (compare) {
          pair.diffImage = compare;
          data = null;
          pair.diff.getDiffImage = null;
          return pair;
        });
      })


  }, {concurrency: config.asyncCompareLimit || ASYNC_COMPARE_LIMIT}).then(function () {
    return report;
  }, function (e) {
    console.log(e);
    logger.error('The comparison failed with error: '+ e);
  });
};

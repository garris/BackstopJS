var resemble = require('node-resemble-js');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var junitWriter = new (require('junitwriter'))();
var streamToPromise = require('../util/streamToPromise');

module.exports = {
  execute: function (config) {
    var compareConfig = JSON.parse(fs.readFileSync(config.compareConfigFileName, 'utf8')).compareConfig;
    var testSuite = config.report &&
      config.report.indexOf('CI') > -1 &&
      config.ciReport.format === 'junit' &&
      junitWriter.addTestsuite(config.ciReport.testSuiteName);

    var tests = _.map(compareConfig.testPairs, function (pair) {
      pair.testStatus = 'running';

      var referencePath = path.join(config.backstop, pair.reference);
      var testPath = path.join(config.backstop, pair.test);

      return compareImage(referencePath, testPath)
        .then(function logCompareResult (data) {
          var imageComparisonFailed = !data.isSameDimensions || data.misMatchPercentage > pair.misMatchThreshold;

          if (imageComparisonFailed) {
            pair.testStatus = 'fail';
            console.log('\x1b[31m', 'ERROR:', pair.label, pair.fileName, '\x1b[0m');

            if (testSuite) {
              var testCase = testSuite.addTestcase(' ›› ' + pair.label, pair.selector);
              var error = 'Design deviation ›› ' + pair.label + ' (' + pair.selector + ') component';
              testCase.addError(error, 'CSS component');
              testCase.addFailure(error, 'CSS component');
            }

            return storeFailedDiffImage(testPath, data).then(function () { return pair; });
          } else {
            pair.testStatus = 'pass';
            console.log('\x1b[32m', 'OK:', pair.label, pair.fileName, '\x1b[0m');
            return pair;
          }
        });
    });

    return Promise.all(tests)
      .then(function logFinalResult (pairs) {
        var results = {};
        var testReportFileName;

        _.each(compareConfig.testPairs, function (pair) {
          if (!results[pair.testStatus]) {
            results[pair.testStatus] = 0;
          }
          !results[pair.testStatus]++;
        });

        console.log('\nTest completed...');
        console.log('\x1b[32m', (results.pass || 0) + ' Passed', '\x1b[0m');
        console.log('\x1b[31m', (results.fail || 0) + ' Failed\n', '\x1b[0m');

        // if the test report is enabled in the config
        if (testSuite) {
          testReportFileName = config.ciReport.testReportFileName.replace(/\.xml$/, '') + '.xml';
          junitWriter.save(path.join(config.ci_report, testReportFileName), function () {
            console.log('\x1b[32m', 'Regression test report file (' + testReportFileName + ') is successfully created.', '\x1b[0m');
          });
        }

        if (results.fail) {
          console.log('\x1b[31m', '*** Mismatch errors found ***', '\x1b[0m');
          console.log('For a detailed report run `npm run openReport`\n');
          throw new Error('Mismatch errors found.');
        }
      });
  }
};

function storeFailedDiffImage (testPath, data) {
  var failedDiffFilename = getFailedDiffFilename(testPath);
  console.log('   See:', failedDiffFilename);

  var failedDiffStream = fs.createWriteStream(failedDiffFilename);
  var storageStream = data.getDiffImage()
    .pack()
    .pipe(failedDiffStream);

  return streamToPromise(storageStream);
}

function getFailedDiffFilename (testPath) {
  var lastSlash = testPath.lastIndexOf(path.sep);
  return testPath.slice(0, lastSlash + 1) + 'failed_diff_' + testPath.slice(lastSlash + 1, testPath.length);
}

function compareImage (referencePath, testPath) {
  return new Promise(function (resolve, reject) {
    resemble(referencePath).compareTo(testPath)
      .onComplete(function (data) {
        resolve(data);
      });
  });
}

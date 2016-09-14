var path = require('path');
var junitWriter = new (require('junitwriter'))();

var fs = require('../util/fs');
var logger = require('../util/logger')('report');
var compare = require('../util/compare');
var utils = require('../util/utils');
var reportHelper = require('../helpers/report.helper');

function writeReport(config, reporter) {
  var promises = [];

  if (config.report && config.report.indexOf('CI') > -1 && config.ciReport.format === 'junit') {
    promises.push(writeJunitReport(config, reporter));
  }

  if (config.report && config.report.indexOf('browser') > -1) {
    promises.push(writeBrowserReport(config, reporter));
  }

  return Promise.all(promises);
}

function writeBrowserReport(config, reporter) {
  var htmlReportPath = utils.toAbsolute(config.html_report);
  logger.log('Writing browser report');

  return fs.copy(config.comparePath, htmlReportPath)
    .then(function () {
      logger.log('Browser reported copied');
    })
    .then(reportHelper.updateTestPairLinks(config, reporter))
    .then(reportHelper.writeReportToFile(config, reporter))
    .then(reportHelper.startReportServer())
    .then(reportHelper.openReport(config))
    .catch(function (err) {
      throw new Error(err);
    });
}

function writeJunitReport(config, reporter) {
  logger.log('Writing jUnit Report');
  var testReportFileName = config.ciReport.testReportFileName.replace(/\.xml$/, '') + '.xml';

  var testSuite = junitWriter.addTestsuite(reporter.testSuite);
  for (var i in reporter.tests) {
    if (!reporter.tests.hasOwnProperty(i)) {
      continue;
    }

    var test = reporter.tests[i];
    var testCase = testSuite.addTestcase(' ›› ' + test.pair.label, test.pair.selector);

    if (!test.passed()) {
      var error = 'Design deviation ›› ' + test.pair.label + ' (' + test.pair.selector + ') component';
      testCase.addError(error, 'CSS component');
      testCase.addFailure(error, 'CSS component');
    }
  }

  return new Promise(function (resolve, reject) {
    var destination = path.join(config.ci_report, testReportFileName);
    junitWriter.save(destination, function (err) {
      if (err) {
        return reject(err);
      }

      logger.success('jUnit report written to: ' + destination);

      resolve();
    });
  });
}

module.exports = {
  execute: function (config) {
    return compare(config).then(function (report) {
      var failed = report.failed();

      logger.log('\nTest completed...');
      logger.log('\x1b[32m' + report.passed() + ' Passed' + '\x1b[0m');
      logger.log('\x1b[31m' + failed + ' Failed\n' + '\x1b[0m');

      return writeReport(config, report).then(function () {
        if (failed) {
          logger.error('*** Mismatch errors found ***');
          logger.log('For a detailed report run `backstop openReport`\n');
          throw new Error('Mismatch errors found.');
        }
      });
    });
  }
};

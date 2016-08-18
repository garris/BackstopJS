var _ = require('underscore');
var path = require('path');
var junitWriter = new (require('junitwriter'))();

var fs = require('../util/fs');
var logger = require('../util/logger')('report');
var compare = require('../util/compare');

function toAbsolute(p) {
  if (p[0] == '/') {
    return p;
  }

  return path.join(process.cwd(), p);
}

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
  logger.log("Writing browser report");
  return fs.copy(config.comparePath, config.html_report).then(function () {
    logger.log("Browser reported copied");

    // Fixing URLs in the configuration
    var report = toAbsolute(config.html_report);
    _.each(reporter.tests, function (item, i) {
      reporter.tests[i].pair.reference = path.relative(report, toAbsolute(item.pair.reference));
      reporter.tests[i].pair.test = path.relative(report, toAbsolute(item.pair.test));

      if (item.pair.diffImage) {
        reporter.tests[i].pair.diffImage = path.relative(report, toAbsolute(item.pair.diffImage));
      }
    });

    var jsonp = 'report(' + JSON.stringify(reporter, null, 2) + ');';
    return fs.writeFile(config.compareConfigFileName, jsonp).then(function () {
      logger.log('Copied configuration:' + config.compareConfigFileName);
    }, function (err) {
      logger.error('Failed configuration copy');
      throw err;
    });
  }).then(function() {
    if (config.openReport) {
      var executeCommand = require('./index');
      return executeCommand('_openReport', config, true);
    }
  });
}

function writeJunitReport(config, reporter) {
  logger.log("Writing jUnit Report");
  var testReportFileName = config.ciReport.testReportFileName.replace(/\.xml$/, '') + '.xml';

  var testSuite = junitWriter.addTestsuite(reporter.testSuite);

  _.each(reporter.tests, function (test) {
    var testCase = testSuite.addTestcase(' ›› ' + test.pair.label, test.pair.selector);

    if (!test.passed()) {
      var error = 'Design deviation ›› ' + test.pair.label + ' (' + test.pair.selector + ') component';
      testCase.addError(error, 'CSS component');
      testCase.addFailure(error, 'CSS component');
    }
  });

  return new Promise(function(resolve, reject) {
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

      console.log('\n');
      logger.log('Test completed...');
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

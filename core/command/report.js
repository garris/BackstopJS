var path = require('path');
var chalk = require('chalk');
var junitWriter = new (require('junitwriter'))();

var allSettled = require('../util/allSettled');
var fs = require('../util/fs');
var logger = require('../util/logger')('report');
var compare = require('../util/compare/');

function writeReport (config, reporter) {
  var promises = [];

  if (config.report && config.report.indexOf('CI') > -1 && config.ciReport.format === 'junit') {
    promises.push(writeJunitReport(config, reporter));
  }

  promises.push(writeBrowserReport(config, reporter));

  return allSettled(promises);
}

function writeBrowserReport (config, reporter) {
  function toAbsolute (p) {
    return (path.isAbsolute(p)) ? p : path.join(config.projectPath, p);
  }
  logger.log('Writing browser report');
  return fs.copy(config.comparePath, toAbsolute(config.html_report)).then(function () {
    logger.log('Browser reported copied');

    // Fixing URLs in the configuration
    var report = toAbsolute(config.html_report);
    for (var i in reporter.tests) {
      if (reporter.tests.hasOwnProperty(i)) {
        var pair = reporter.tests[i].pair;
        reporter.tests[i].pair.reference = path.relative(report, toAbsolute(pair.reference));
        reporter.tests[i].pair.test = path.relative(report, toAbsolute(pair.test));

        if (pair.diffImage) {
          reporter.tests[i].pair.diffImage = path.relative(report, toAbsolute(pair.diffImage));
        }
      }
    }

    var jsonp = 'report(' + JSON.stringify(reporter, null, 2) + ');';
    return fs.writeFile(toAbsolute(config.compareConfigFileName), jsonp).then(function () {
      logger.log('Copied configuration to: ' + toAbsolute(config.compareConfigFileName));
    }, function (err) {
      logger.error('Failed configuration copy');
      throw err;
    });
  }).then(function () {
    if (config.openReport && config.report && config.report.indexOf('browser') > -1) {
      var executeCommand = require('./index');
      return executeCommand('_openReport', config);
    }
  });
}

function writeJunitReport (config, reporter) {
  logger.log('Writing jUnit Report');

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
    var testReportFilename = config.testReportFileName || config.ciReport.testReportFileName;
    testReportFilename = testReportFilename.replace(/\.xml$/, '') + '.xml';
    var destination = path.join(config.ci_report, testReportFilename);
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
      logger.log('Test completed...');
      logger.log(chalk.green(report.passed() + ' Passed'));
      logger.log(chalk[(failed ? 'red' : 'green')](+failed + ' Failed'));

      return writeReport(config, report).then(function (results) {
        for (var i = 0; i < results.length; i++) {
          if (results[i].state !== 'fulfilled') {
            logger.error('Failed writing report with error: ' + results[i].value);
          }
        }

        if (failed) {
          logger.error('*** Mismatch errors found ***');
          // logger.log('For a detailed report run `backstop openReport`\n');
          throw new Error('Mismatch errors found.');
        }
      });
    }, function (e) {
      logger.error('Comparison failed with error:' + e);
    });
  }
};

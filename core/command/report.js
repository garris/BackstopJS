var path = require('path');
var junitWriter = new (require('junitwriter'))();

var fs = require('../util/fs');
var logger = require('../util/logger')('report');
var compare = require('../util/compare');

function writeReport (config, reporter) {
  var promises = [];

  if (config.report && config.report.indexOf('CI') > -1 && config.ciReport.format === 'junit') {
    promises.push(writeJunitReport(config, reporter));
  }

  promises.push(writeBrowserReport(config, reporter));

  return Promise.all(promises);
}

function writeBrowserReport (config, reporter) {
  function toAbsolute (p) {
    if (path.isAbsolute(p)) {
      return p;
    }
    return path.join(config.customBackstop, p);
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
      var passTag = '\x1b[32m', failTag = '\x1b[31m';
      logger.log('\nTest completed...');
      logger.log(passTag + report.passed() + ' Passed' + '\x1b[0m');
      logger.log((failed ? failTag : passTag) + failed + ' Failed\n' + '\x1b[0m');

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

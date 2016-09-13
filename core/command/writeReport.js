var path = require('path');

var fs = require('../util/fs');
var logger = require('../util/logger')('report');
var compare = require('../util/compare');

function writeBrowserReport(config, reporter) {
  function toAbsolute(p) {
    if (p[0] === '/') {
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

        reporter.tests[i].pair.reference = pair.reference;
        reporter.tests[i].pair.test = pair.test;

        if (pair.diffImage) {
          reporter.tests[i].pair.diffImage = path.relative(report, toAbsolute(pair.diffImage));
        }
      }
    }

    var jsonp = 'report(' + JSON.stringify(reporter, null, 2) + ');';
    return fs.writeFile(toAbsolute(config.compareConfigFileName), jsonp).then(function () {
      logger.log('Copied configuration:' + config.compareConfigFileName);
    }, function (err) {
      logger.error('Failed configuration copy');
      throw err;
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

      return writeBrowserReport(config, report).then(function () {
        if (failed) {
          logger.error('*** Mismatch errors found ***');
          logger.log('For a detailed report run `backstop openReport`\n');
          throw new Error('Mismatch errors found.');
        }
      });
    });
  }
};

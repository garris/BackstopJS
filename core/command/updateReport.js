var path = require('path');

var fs = require('../util/fs');
var logger = require('../util/logger')('report');
var compare = require('../util/compare');
var utils = require('../util/utils');
var reportHelper = require('../helpers/report.helper');

function writeBrowserReport(config, reporter) {
  var htmlReportPath = utils.toAbsolute(config.html_report);
  logger.log('Writing browser report');

  return fs.copy(config.comparePath, htmlReportPath)
    .then(function () {
      logger.log('Browser reported copied');
    })
    .then(reportHelper.updateTestPairLinks(config, reporter, true))
    .then(reportHelper.writeReportToFile(config, reporter))
    .catch(function(err) {
      throw err;
    });
}

module.exports = {
  execute: function (config) {
    return compare(config).then(function (report) {
      var failed = report.failed();

      logger.log('\nTest completed...');
      logger.log('\x1b[32m' + report.passed() + ' Passed' + '\x1b[0m');
      logger.log('\x1b[31m' + failed + ' Failed\n' + '\x1b[0m');

      return writeBrowserReport(config, report);
    });
  }
};

'use strict';

var fs = require('../util/fs');
var util = require('../util/utils');
var spawn = require('../util/spawn').spawn;
var logger = require('../util/logger')('report');
var path = require('path');

module.exports = {

  writeReportToFile: function (config, reporter) {
    var data = 'report(' + JSON.stringify(reporter, null, 2) + ');';
    var path = util.toAbsolute(config.compareConfigFileName);

    return fs.writeFile(path, data).then(function () {
      logger.log('Copied configuration:' + config.compareConfigFileName);
    }, function (err) {
      logger.error('Failed configuration copy');
      throw err;
    });
  },

  updateTestPairLinks: function (config, reporter, diffOnly) {
    var report = util.toAbsolute(config.html_report);

    reporter.tests.forEach(function (test) {
      if(!diffOnly) {
        test.pair.reference = path.relative(report, util.toAbsolute(test.pair.reference));
        test.pair.test = path.relative(report, util.toAbsolute(test.pair.test));
      }

      if (test.pair.diffImage) {
        test.pair.diffImage = path.relative(report, util.toAbsolute(test.pair.diffImage));
      }
    });

    return Promise.resolve(reporter);
  },

  openReport: function (config) {
    if (config.openReport) {
      var executeCommand = require('../command/index');
      return executeCommand('_openReport', config);
    }
  },

  startReportServer: function() {
    // start the server needed for report functionality
    spawn('npm', ['run', 'server'], {
      cwd: __dirname
    });

    return Promise.resolve();
  }

};

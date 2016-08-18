var open = require('open');
var isWin = require('../util/isWin');
var fs = require('../util/fs');
var logger = require('../util/logger')('openReport');

module.exports = {
  execute: function (config) {

    return new Promise(function (resolve, reject) {
      logger.log("Opening browser to show report");
      open(config.compareReportURL, isWin ? 'chrome' : 'Google Chrome', function (err) {
        if (err) {
          reject(err);
        }

        resolve();
      });
    })
  }
};

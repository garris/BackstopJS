var open = require('open');
var isWin = require('../util/isWin');
var logger = require('../util/logger')('openReport');

module.exports = {
  execute: function (config) {
    return new Promise(function (resolve, reject) {
      logger.log('Opening browser to show report');
      open(config.compareReportURL, function (err) {
        if (err) {
          console.error("An error occured while opening report in the default browser.")
          // reject(err);
        }
        resolve();
      });
    });
  }
};

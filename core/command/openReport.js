var open = require('open');
var logger = require('../util/logger')('openReport');

module.exports = {
  execute: function (config) {
    return new Promise(function (resolve, reject) {
      logger.log('Opening report.');
      open(config.compareReportURL, function (err) {
        if (err) {
          logger.error('An error occured while opening report in the default browser.');
        }
        resolve();
      });
    });
  }
};

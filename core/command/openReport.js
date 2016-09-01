var open = require('open');
var logger = require('../util/logger')('openReport');
var path = require('path');

module.exports = {
  execute: function (config) {

    function toAbsolute (p) {
      if (p[0] === '/') {
        return p;
      }
      return path.join(config.customBackstop, p);
    }

    return new Promise(function (resolve, reject) {
      logger.log('Opening report.');
      open(toAbsolute(config.compareReportURL), function (err) {
        if (err) {
          logger.error('An error occured while opening report in the default browser.');
        }
        resolve();
      });
    });
  }
};

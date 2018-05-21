var open = require('opn');
var logger = require('../util/logger')('openReport');
var path = require('path');

module.exports = {
  execute: function (config) {
    function toAbsolute (p) {
      if (path.isAbsolute(p)) {
        return p;
      }
      return path.join(config.projectPath, p);
    }

    logger.log('Opening report.');
    return open(toAbsolute(config.compareReportURL), {wait: false});
  }
};

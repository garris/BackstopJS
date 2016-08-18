var fs = require('../util/fs');
var logger = require('../util/logger')('clean');

module.exports = {
  execute: function (config) {
    return fs.remove(config.bitmaps_reference).then(function() {
      logger.success('bitmaps_reference was cleaned.');
    });
  }
};

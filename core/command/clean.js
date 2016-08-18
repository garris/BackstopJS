var del = require('del');
var logger = require('../util/logger')('clean');

module.exports = {
  execute: function (config) {
    return del(
      [ config.bitmaps_reference + '/**'],
      { force: true }
    ).then(function() {
      logger.success('bitmaps_reference was cleaned.');
    });
  }
};

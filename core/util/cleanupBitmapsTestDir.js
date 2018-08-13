var fs = require('../util/fs');
var logger = require('../util/logger')('clean');

function cleanupBitmapsTestDir (config) {
  if (config.cleanupBitmapsTestDir) {
    return fs.remove(config.bitmaps_test).then(function () {
      logger.success(config.bitmaps_test + ' was cleaned.');
    });
  }
  return Promise.resolve();
}

module.exports = cleanupBitmapsTestDir;

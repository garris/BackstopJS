var paths = require('../util/paths');
var checksum = require('checksum');
var fs = require('../util/fs');
var updateCompareConfig = require('../util/updateCompareConfig');

module.exports = {
  execute: function () {
    return fs.readFile(
      paths.activeCaptureConfigPath,
      { encoding: 'utf8' }
    )
      .then(function (config) {
        updateCompareConfig(function (compareConfig) {
          compareConfig.lastConfigHash = checksum(config.toString());
        });
      });
  }
};

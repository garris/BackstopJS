var checksum = require('checksum');
var fs = require('../util/fs');
var updateCompareConfig = require('../util/updateCompareConfig');

module.exports = {
  execute: function (config) {
    return fs.readFile(config.backstopConfigFileName, {encoding: 'utf8'})
      .then(function (config) {
        return config[0];
      })
      .then(function (customConfig) {
        updateCompareConfig(config, function (compareConfig) {
          compareConfig.lastConfigHash = checksum(customConfig.toString());
        });
      });
  }
};

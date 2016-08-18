var checksum = require('checksum');
var fs = require('../util/fs');

module.exports = {
  execute: function (config) {
    return fs.readFile(config.backstopConfigFileName, {encoding: 'utf8'})
      .then(function (customConfig) {
        return customConfig[0];
      })
      .then(function (customConfig) {
        return fs.writeFile(config.configHash, checksum(customConfig.toString()));
      });
  }
};

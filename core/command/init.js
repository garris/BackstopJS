var fs = require('../util/fs');

module.exports = {
  execute: function (config) {
    // Serialize config as JSON into capture config.
    return fs.readFile(config.backstopConfigFileName)
      .then(function (result) {
        return result[0];
      })
      .then(function (customConfig) {
        return fs.writeFile(
          config.captureConfigFileName,
          customConfig
        );
      });
  }
};

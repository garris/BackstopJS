var fs = require('../util/fs');

module.exports = {
  execute: function (config) {
    if (config.backstopConfigFileName.substr(-3) === ".js") {
      var configJSON = JSON.stringify(require(config.backstopConfigFileName));
      return fs.writeFile(config.captureConfigFileName, configJSON);
    } else {
      // Serialize config as JSON into capture config.
      return fs.readFile(config.backstopConfigFileName)
        .then(function (result) {
          return result[0];
        })
        .then(function (customConfig) {
          return fs.writeFile(config.captureConfigFileName, customConfig);
        });
    }
  }
};

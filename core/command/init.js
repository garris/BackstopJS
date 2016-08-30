var fs = require('../util/fs');

module.exports = {
  execute: function (config) {
    var configJSON = require(config.backstopConfigFileName);

    configJSON.paths.tempCompareConfigFileName = config.tempCompareConfigFileName;

    return fs.writeFile(config.captureConfigFileName, JSON.stringify(configJSON));
  }
};

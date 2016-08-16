var fs = require('../util/fs');

module.exports = {
  execute: function (config) {
    var configJSON = JSON.stringify(require(config.backstopConfigFileName));
    return fs.writeFile(config.captureConfigFileName, configJSON);
  }
};

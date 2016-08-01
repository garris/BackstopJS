var fs = require('../util/fs');
var paths = require('../util/paths');

module.exports = {
  execute: function () {
    var config = require(paths.activeCaptureConfigPath);

    // Serialize config as JSON into capture config.
    return fs.writeFile(
      paths.captureConfigFileName,
      JSON.stringify(config)
    );
  }
};

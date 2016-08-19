var paths                   = require('../util/paths');
var fs                     = require('fs');

var config = require(paths.activeCaptureConfigPath);
// Serialize config as JSON into capture config.
fs.writeFileSync(paths.captureConfigFileName, JSON.stringify(config));

var paths                   = require('../util/paths');
var fse                     = require('fs-extra');

fse.copySync(paths.activeCaptureConfigPath,paths.captureConfigFileName);

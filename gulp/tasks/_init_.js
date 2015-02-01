var fs                      = require('fs');
var fse                     = require('fs-extra');
var paths                   = require('../util/paths');
var genDefaultCompareConfig = require('../util/genDefaultCompareConfig');

// LEFTOVERS FROM GULP SPLIT
// TODO Is any of this still needed?
//   Or is it just cruft that was hiding in a large file?

//this is for compare/genBitmaps.js until we can pass the active location via env
fse.copySync(paths.activeCaptureConfigPath,paths.captureConfigFileName);

if(!fs.existsSync(paths.compareConfigFileName)){
  console.log('No compare/config.json file exists. Creating default file.')
  genDefaultCompareConfig();
}

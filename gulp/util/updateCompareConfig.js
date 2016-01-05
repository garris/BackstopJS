var paths = require('./paths');
var fsx = require('fs-extra');

var updateCompareConfig = function(updateCallback) {
  fsx.ensureFileSync(paths.compareConfigFileName);
  var compareConfigFile = fsx.readJsonSync(paths.compareConfigFileName, {throws: false}) || {};
  updateCallback(compareConfigFile);
  fsx.writeFileSync(paths.compareConfigFileName, JSON.stringify(compareConfigFile,null,2));
};

module.exports = updateCompareConfig;

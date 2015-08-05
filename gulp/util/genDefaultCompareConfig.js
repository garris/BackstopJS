var fsx = require('fs-extra');
var paths = require('./paths');


var configDefault = {
  "testPairs": []
};

var genDefaultCompareConfig = function () {
  fsx.ensureFileSync(paths.compareConfigFileName);
  fsx.writeFileSync(paths.compareConfigFileName, JSON.stringify(configDefault,null,2));
};

module.exports = genDefaultCompareConfig;

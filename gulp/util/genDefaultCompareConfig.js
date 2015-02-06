var fs = require('fs');
var paths = require('./paths');


var configDefault = {
  "testPairs": []
};

var genDefaultCompareConfig = function () {
  fs.writeFileSync(paths.compareConfigFileName, JSON.stringify(configDefault,null,2));
};


module.exports = genDefaultCompareConfig;

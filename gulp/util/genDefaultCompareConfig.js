var fs = require('fs');
var paths = require('./paths');


var configDefault = {
  "testPairs": []
};

var genDefaultCompareConfig = function (cb) {
  fs.writeFile(paths.compareConfigFileName, JSON.stringify(configDefault,null,2), function(err){
    if (err) {
      console.log('error: while genDefaultCompareConfig();')
    }
    if (typeof cb == 'object') cb();
  });
};

module.exports = genDefaultCompareConfig;

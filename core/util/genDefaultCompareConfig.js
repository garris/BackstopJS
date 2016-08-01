var updateCompareConfigs = require('./updateCompareConfig');

var configDefault = {
  "testPairs": []
};

var genDefaultCompareConfig = function () {
  updateCompareConfigs(function(compareConfigFile) {
    compareConfigFile.compareConfig = JSON.stringify(configDefault,null,2);
  });
};

module.exports = genDefaultCompareConfig;

var updateCompareConfig = require('./updateCompareConfig');

var configDefault = {
  testPairs: []
};

var genDefaultCompareConfig = function (config) {
  updateCompareConfig(config, function (compareConfigFile) {
    compareConfigFile.compareConfig = configDefault;
  });
};

module.exports = genDefaultCompareConfig;

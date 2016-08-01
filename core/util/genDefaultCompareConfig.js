var updateCompareConfig = require('./updateCompareConfig');

var configDefault = {
  testPairs: []
};

var genDefaultCompareConfig = function () {
  updateCompareConfig(function (compareConfigFile) {
    compareConfigFile.compareConfig = JSON.stringify(configDefault, null, 2);
  });
};

module.exports = genDefaultCompareConfig;

var fsx = require('fs-extra');

var updateCompareConfig = function (config, updateCallback) {
  fsx.ensureFileSync(config.compareConfigFileName);
  var compareConfigFile = fsx.readJsonSync(config.compareConfigFileName, {throws: false}) || {};
  updateCallback(compareConfigFile);

  fsx.writeFileSync(
    config.compareConfigFileName,
    JSON.stringify(compareConfigFile, null, 2)
  );
};

module.exports = updateCompareConfig;

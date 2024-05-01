const fs = require('../util/fs');
const logger = require('../util/logger')('init');

/**
 * Copies a boilerplate config file to the current config file location.
 */
module.exports = {
  execute: function init (config) {
    const promises = [];
    if (config.engine_scripts) {
      logger.log("Copying '" + config.engine_scripts_default + "' to '" + config.engine_scripts + "'");
      promises.push(fs.copy(config.engine_scripts_default, config.engine_scripts));
    } else {
      logger.error('ERROR: Can\'t generate a scripts directory. No \'engine_scripts\' path property was found in backstop.json.');
    }

    const resolveAndWriteConfigFile = (fileName, useJs) => {
      const extension = useJs ? '.js' : '.json';
      if (!fileName.endsWith(extension)) {
        fileName += extension;
      }

      const writeFile = () => {
        if (useJs) {
          return fs.copy(config.captureConfigFileNameDefault, fileName);
        } else {
          const configContent = require(config.captureConfigFileNameDefault);
          const jsonContent = JSON.stringify(configContent, null, 2);
          return fs.writeFile(fileName, `module.exports = ${jsonContent};`);
        }
      };

      return writeFile().then(() => fileName); // Return fileName after the operation
    };

    console.log(config);

    // Copies a boilerplate config file to the current config file location.
    promises.push(resolveAndWriteConfigFile(config.backstopConfigFileName, config.args.js).then(configFile => {
      logger.log("Configuration file written at '" + configFile + "'");
    }, function (err) {
      throw err;
    }));

    return Promise.all(promises);
  }
};

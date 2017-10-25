var path = require('path');
var extendConfig = require('./extendConfig');

function projectPath (config) {
  // Legacy mode, if the cwd is the backstop module
  // if (config.backstop === process.cwd()) {
  //   console.log('BackstopJS is running in legacy mode.');
  //   return path.join(__dirname, '../../../..');
  // }
  return process.cwd();
}

function loadProjectConfig (command, options, config) {
  // TEST REPORT FILE NAME
  var customTestReportFileName = options && (options.testReportFileName || null);
  if (customTestReportFileName) {
    config.testReportFileName = options.testReportFileName || null;
  }

  var customConfigPath = options && (options.backstopConfigFilePath || options.configPath);
  if (options && typeof options.config === 'string' && !customConfigPath) {
    customConfigPath = options.config;
  }

  if (customConfigPath) {
    if (path.isAbsolute(customConfigPath)) {
      config.backstopConfigFileName = customConfigPath;
    } else {
      config.backstopConfigFileName = path.join(config.projectPath, customConfigPath);
    }
  } else {
    config.backstopConfigFileName = path.join(config.projectPath, 'backstop.json');
  }

  var userConfig = {};
  var CMD_REQUIRES_CONFIG = command !== 'genConfig';
  if (CMD_REQUIRES_CONFIG) {
    if (options && typeof options.config === 'object') {
      console.log('Config detected:');
      userConfig = options.config;
    } else if (config.backstopConfigFileName) {
      try {
        //Remove from cache config content
 +      delete require.cache[require.resolve(config.backstopConfigFileName)]
        console.log('Loading config: ', config.backstopConfigFileName, '\n');
        userConfig = require(config.backstopConfigFileName);
      } catch (e) {
        console.error('Error ' + e);
        process.exit(1);
      }
    }
  }

  return userConfig;
}

function makeConfig (command, options) {
  var config = {};

  config.args = options || {};

  config.backstop = path.join(__dirname, '../..');
  config.projectPath = projectPath(config);
  config.perf = {};

  var userConfig = loadProjectConfig(command, options, config);

  return extendConfig(config, userConfig);
}

module.exports = makeConfig;

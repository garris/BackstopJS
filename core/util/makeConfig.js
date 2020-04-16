var path = require('path');
var extendConfig = require('./extendConfig');

const NON_CONFIG_COMMANDS = ['init', 'version', 'stop'];

function projectPath (config) {
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
  const CMD_REQUIRES_CONFIG = !NON_CONFIG_COMMANDS.includes(command);
  if (CMD_REQUIRES_CONFIG) {
    // This flow is confusing -- is checking for !config.backstopConfigFileName more reliable?
    if (options && typeof options.config === 'object' && options.config.scenarios) {
      console.log('Object-literal config detected.');
      if (options.config.debug) {
        console.log(JSON.stringify(options.config, null, 2));
      }
      userConfig = options.config;
    } else if (config.backstopConfigFileName) {
      // Remove from cache config content
      delete require.cache[require.resolve(config.backstopConfigFileName)];
      console.log('Loading config: ', config.backstopConfigFileName, '\n');
      userConfig = require(config.backstopConfigFileName);
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

  var userConfig = Object.assign({}, loadProjectConfig(command, options, config));

  return extendConfig(config, userConfig);
}

module.exports = makeConfig;

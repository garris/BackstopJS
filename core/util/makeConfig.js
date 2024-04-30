const path = require('path');
const fs = require('fs');
const extendConfig = require('./extendConfig');
const logger = require('../util/logger')('init');

const NON_CONFIG_COMMANDS = ['init', 'version', 'stop'];

function projectPath () {
  return process.cwd();
}

function loadProjectConfig (command, options, config) {
  options = options || {}; // make sure options is an object

  // TEST REPORT FILE NAME
  if (options.testReportFileName) {
    config.testReportFileName = options.testReportFileName;
  }

  // list of "config" files to search for
  const configFiles = ['backstop.json', 'backstop.js'];

  // If a config file is specified in the options, add it to the list
  if (options.config && typeof options.config === 'string') {
    configFiles.unshift(options.config);
    configFiles.unshift(path.join(config.projectPath, options.config));
  }

  // Searching for the first existing config file
  for (const configFile of configFiles) {
    const configPath = path.join(config.projectPath, configFile);
    if (fs.existsSync(configPath)) {
      config.backstopConfigFileName = configPath;
      break; // Stop searching once a valid config file is found
    }
  }

  if (!config.backstopConfigFileName) {
    logger.error('No config file found in project path: ' + config.projectPath);
    logger.error('Looked for: ' + configFiles.join(', '));
    process.exit(1);
  }

  let userConfig = {};
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
  const config = {};

  config.args = options || {};

  config.backstop = path.join(__dirname, '../..');
  config.projectPath = projectPath(config);
  config.perf = {};

  const userConfig = Object.assign({}, loadProjectConfig(command, options, config));

  return extendConfig(config, userConfig);
}

module.exports = makeConfig;

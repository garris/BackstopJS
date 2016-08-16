#!/usr/bin/env node

var path = require('path');
var parseArgs = require('minimist');
var usage = require('./usage');
var fs = require('../core/util/fs');
var executeCommand = require('../core/command');
var version = require('../package.json').version;

var argsOptions = parseArgs(process.argv.slice(2), {
  boolean: ['h', 'help', 'v', 'version'],
  string: ['config', 'port', 'p'],
  default: {
    config: 'backstop.json'
  }
});

if (argsOptions.h || argsOptions.help) {
  usage();
  process.exit();
}

if (argsOptions.v || argsOptions.version) {
  console.log('BackstopJS ' + version);
  process.exit();
}

var commandName = argsOptions['_'][0];
var configPath = path.join(process.cwd(), argsOptions['configPath']);

if (!commandName) {
  usage();
  process.exit();
} else {

  var config;

  try {
    config = require(configPath);
  } catch (e) {
    console.error("Error " + e);
    process.exit(1);
  }

  config = applyCliArgs(config, argsOptions);
  executeCommand(commandName, config, false).catch(function(e) {
    console.error("Error " + e);
    usage();
  });
}

function applyCliArgs (baseConfig, argsOptions) {
  baseConfig.portNumber = argsOptions.port || argsOptions.p || baseConfig.portNumber;
  return baseConfig;
}

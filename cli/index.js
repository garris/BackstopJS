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
    config: '../../backstop.json'
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
var configPath = path.join(process.cwd(), argsOptions['config']);

if (!commandName) {
  usage();
  process.exit();
} else {
  fs.readFile(configPath)
    .then(function (buffer) {
      return JSON.parse(buffer.toString());
    })
    .catch(function () {
      return {};
    })
    .then(function (baseConfig) {
      var config = applyCliArgs(baseConfig, argsOptions);
      return executeCommand(commandName, config, false);
    })
    .catch(function (e) {
      usage();
    });
}

function applyCliArgs (baseConfig, argsOptions) {
  baseConfig.portNumber = argsOptions.port || argsOptions.p || baseConfig.portNumber;
  return baseConfig;
}

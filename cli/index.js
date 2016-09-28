#!/usr/bin/env node

var parseArgs = require('minimist');
var usage = require('./usage');
var makeConfig = require('../core/util/makeConfig');
var executeCommand = require('../core/command');
var version = require('../package.json').version;

var argsOptions = parseArgs(process.argv.slice(2), {
  boolean: ['h', 'help', 'v', 'version', 'i'],
  string: ['config'],
  default: {
    config: 'backstop.json'
  }
});

// Catch errors from failing promises
process.on('unhandledRejection', function (error, promise) {
  console.error(error.stack);
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

if (!commandName) {
  usage();
  process.exit();
} else {
  var config = makeConfig(argsOptions);
  var exitCode = 0;
  executeCommand(commandName, config).catch(function () {
    exitCode = 1;
  });

  /*
   * Wait for the stdout buffer to drain.
   */
  process.on('exit', function () {
    process.exit(exitCode);
  });
}

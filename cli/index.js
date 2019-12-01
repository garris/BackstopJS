#!/usr/bin/env node

var parseArgs = require('minimist');
var usage = require('./usage');
var version = require('../package.json').version;
var runner = require('../core/runner');

main();

function main () {
  var argsOptions = parseArgs(process.argv.slice(2), {
    boolean: ['h', 'help', 'v', 'version', 'i', 'docker'],
    string: ['config'],
    default: {
      config: 'backstop.json'
    }
  });

  // Catch errors from failing promises
  process.on('unhandledRejection', function (error) {
    console.error(error && error.stack);
  });

  if (argsOptions.h || argsOptions.help) {
    console.log(usage);
    return;
  }

  if (argsOptions.v || argsOptions.version) {
    console.log('BackstopJS v' + version);
    return;
  }

  var commandName = argsOptions['_'][0];

  if (!commandName) {
    console.log(usage);
  } else {
    console.log('BackstopJS v' + version);
    runner(commandName, argsOptions).catch(function () {
      process.exitCode = 1;
    });

    process.on('uncaughtException', function (err) {
      console.log('Uncaught exception:', err.message, err.stack);
      throw err;
    });
  }
}

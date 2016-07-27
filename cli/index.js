#!/usr/bin/env node

var parseArgs = require('minimist');
var usage = require('./usage');
var commands = require('../core/command');
var version = require('../package.json').version;

var argsOptions = parseArgs(process.argv.slice(2), {
  'boolean': ['h', 'help', 'v', 'version']
});

if (argsOptions.h || argsOptions.help) {
  usage();
  process.exit();
}

if (argsOptions.v || argsOptions.version) {
  console.log('BackstopJS ' + version);
  process.exit();
}

const commandName = argsOptions['_'][0];

if (!commandName) {
  usage();
  process.exit();
} else {
  try {
    commands.apply(this, argsOptions['_']);
  } catch (e) {
    console.error(e.message);
    usage();
    process.exit();
  }
}

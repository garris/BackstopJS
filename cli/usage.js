var version = require('../package.json').version;
var makeSpaces = require('../core/util/makeSpaces');

var commandsDescription = {
  genConfig: 'Generate a configuration file for your project',
  reference: 'reference!!',
  test: 'test!!',
  bless: 'bless!!',
  start: 'start!!',
  stop: 'stop!!',
  openReport: 'openReport!!',
  echo: 'echo!!'
};

var optionsDescription = {
  '-h, --help': 'Display usage',
  '-v, --version': 'Display version'
};

// Number of spaces to echap before writing description
var padding = Object.keys(commandsDescription)
  .concat(Object.keys(optionsDescription))
  .map(function (string) {
    return string.length;
  })
  .reduce(function maxReducer (max, length) {
    return Math.max(max, length);
  }, 0);

function makeDescription (descriptions) {
  return Object.keys(descriptions)
    .map(function (commandName) {
      return makeSpaces(4) + commandName + makeSpaces(2 + padding - commandName.length) + descriptions[commandName];
    })
    .join('\n');
}

function usage () {
  console.log('\
Welcome to BackstopJS ' + version + ' CLI\n\
\n\
Commands:\n\
' + makeDescription(commandsDescription) + '\n\
\n\
Options:\n\
' + makeDescription(optionsDescription) + '\n\
  \n')
}

module.exports = usage;

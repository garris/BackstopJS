var version = require('../package.json').version;
var makeSpaces = require('../core/util/makeSpaces');

var commandsDescription = {
  reference: 'Create reference screenshots of your web content at multiple sceen sizes.',
  test: 'Create test screenshots of your web content and compare against the set you created using `backstop reference`.',
  genConfig: 'Generate a configuration file boilerplate in your current directory. PLEASE NOTE: this will force overwrite any existing config.',
  openReport: 'View your last test screenshots in your browser.'
};

var optionsDescription = {
  '-h, --help': 'Display usage',
  '-v, --version': 'Display version',
  '-i': 'Incremental reference generation'
};

function makeDescription (descriptions) {
  return Object.keys(descriptions)
    .map(function (commandName) {
      return makeSpaces(4) + commandName + spacesBetweenCommandAndDescription(commandName) + descriptions[commandName];
    })
    .join('\n');
}

function spacesBetweenCommandAndDescription (commandName) {
  return makeSpaces(2 + leftPaddingOfDescription - commandName.length);
}

// Number of spaces to echo before writing description
var leftPaddingOfDescription = Object.keys(commandsDescription)
  .concat(Object.keys(optionsDescription))
  .map(function (string) {
    return string.length;
  })
  .reduce(function maxReducer (max, length) {
    return Math.max(max, length);
  }, 0);

var usage = '\
Welcome to BackstopJS ' + version + ' CLI\n\
\n\
Commands:\n\
' + makeDescription(commandsDescription) + '\n\
\n\
Options:\n\
' + makeDescription(optionsDescription) + '\n\
\n';

module.exports = usage;

const chalk = require('chalk');
const _ = require('lodash');
const makeSpaces = require('./makeSpaces');

function identity (string) { return string; }

const typeToColor = {
  error: identity,
  warn: identity,
  log: identity,
  info: identity,
  debug: identity,
  success: identity
};

const typeToTitleColor = {
  error: chalk.red,
  warn: chalk.yellow,
  log: chalk.white,
  info: chalk.grey,
  debug: chalk.blue,
  success: chalk.green
};

let longestTitle = 5;

function paddedString (length, string) {
  const padding = makeSpaces(length + 3);

  if (string instanceof Error) {
    string = string.stack;
  }

  if (typeof string !== 'string') {
    return string;
  }

  const lines = string.split('\n');
  const paddedLines = lines
    .slice(1)
    .map(function addPadding (string) {
      return padding + string;
    });
  paddedLines.unshift(lines[0]);

  return paddedLines.join('\n');
}

function message (type, subject, string) {
  if (!_.has(typeToColor, type)) {
    type = 'info';
    console.log(typeToColor.warn('Type ' + type + ' is not defined as logging type'));
  }

  if (subject.length < longestTitle) {
    const appendChar = ' ';
    while (subject.length < longestTitle) {
      subject = appendChar + subject;
    }
  } else {
    longestTitle = subject.length;
  }

  console.log(typeToTitleColor[type](subject + ' ') + '| ' + paddedString(longestTitle, typeToColor[type](string)));
}

module.exports = function (subject) {
  return {
    error: message.bind(null, 'error', subject),
    warn: message.bind(null, 'warn', subject),
    log: message.bind(null, 'log', subject),
    info: message.bind(null, 'info', subject),
    debug: message.bind(null, 'debug', subject),
    success: message.bind(null, 'success', subject)
  };
};

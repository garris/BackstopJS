var path = require('path');

/*
 * Each file included in this folder (except `index.js`) is a command and must export the following object
 * {
 *   before: (optional) [string] | array of scripts to execute sequentially before the command itself
 *   execute: (...args) => void  | command itself
 *   after: (optional) [string]  | array of scripts to execute sequentially after the command itself
 * }
 *
 * The execute function should not have much logic
 */

/* Each and every command defined, including commands used in before/after */
var commandNames = [
];

/* Commands that are only exposed to higher levels */
var exposedCommandNames = [
];

/* Used to convert an array of objects {name, execute} to a unique object {[name]: execute} */
function toObjectReducer (object, command) {
  var commandObject = {};
  commandObject[command.name] = command.execute;

  return Object.assign(
    {},
    object,
    commandObject
  );
}

function executeCommand (commandName) {
  if (typeof commandName === 'string' && commands.hasOwnProperty(commandName)) {
    commands[commandName].apply(this, arguments.slice(1));
  } else {
    console.log('WARN: The command "' + commandName + '" does not exist');
  }
}

function executeCommands (commandNames) {
  if (!typeof commandNames === 'object' || typeof commandNames.length === 'undefined') {
    console.log('WARN: The list of command names must be an array');
    return;
  }

  commandNames.forEach(function (commandName) {
    executeCommand.apply(this, [commandName].concat(arguments.slice(1)));
  });
}

var commands = commandNames
  .map(function requireCommand (commandName) {
    return {
      name: commandName,
      commandDefinition: require(path.join('./', commandName))
    };
  })
  .map(function definitionToExecution (command) {
    return {
      name: command.commandName,
      execute: function execute () {
        executeCommands.apply(this, [command.commandDefinition.before].concat(arguments));
        command.commandDefinition.execute.apply(this, arguments);
        executeCommands.apply(this, [command.commandDefinition.after].concat(arguments));
      }
    };
  })
  .reduce(toObjectReducer, {});

var exposedCommands = exposedCommandNames
  .filter(function commandIsDefined (commandName) {
    return commands.hasOwnProperty(commandName);
  })
  .map(function (commandName) {
    return {
      name: commandName,
      execute: commands[commandName]
    };
  })
  .reduce(toObjectReducer, {});

module.exports = function execute (commandName) {
  if (!exposedCommands.hasOwnProperty(commandName)) {
    throw new Error('The command `' + commandName + '` is not exposed publicly.');
  }

  exposedCommands[commandName].apply(this, arguments.slice(1));
};

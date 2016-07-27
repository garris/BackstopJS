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

function executeCommand (commandName, args) {
  if (typeof commandName === 'string' && commands.hasOwnProperty(commandName)) {
    commands[commandName].apply(this, args.slice(1));
  } else {
    console.log('WARN: The command "' + commandName + '" does not exist');
  }
}

function executeCommands (commandNames, args) {
  if (!commandNames || !typeof commandNames === 'object' || typeof commandNames.forEach !== 'function') {
    return;
  }

  commandNames.forEach(function (commandName) {
    executeCommand(commandName, args);
  });
}

var commands = commandNames
  .map(function requireCommand (commandName) {
    return {
      name: commandName,
      commandDefinition: require(path.join(__dirname, commandName))
    };
  })
  .map(function definitionToExecution (command) {
    return {
      name: command.name,
      execute: function execute (args) {
        executeCommands(command.commandDefinition.before, args);
        command.commandDefinition.execute.apply(this, args);
        executeCommands(command.commandDefinition.after, args);
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
  var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));

  if (!exposedCommands.hasOwnProperty(commandName)) {
    throw new Error('The command `' + commandName + '` is not exposed publicly.');
  }

  exposedCommands[commandName](args);
};

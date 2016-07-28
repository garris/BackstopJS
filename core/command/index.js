var path = require('path');
var Promise = require('es6-promise').Promise;
var logger = require('../util/logger')('COMMAND');

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
  'genScripts',
  'genConfig'
];

/* Commands that are only exposed to higher levels */
var exposedCommandNames = [
  'genConfig'
];

/* Used to convert an array of objects {name, execute} to a unique object {[name]: execute} */
function toObjectReducer (object, command) {
  object[command.name] = command.execute;
  return object;
}

function executeCommand (commandName, args) {
  if (typeof commandName === 'string' && commands.hasOwnProperty(commandName)) {
    return commands[commandName].apply(this, args.slice(1));
  } else {
    logger.warn('The command `' + commandName + '` does not exist');
    return Promise.resolve();
  }
}

function executeCommands (commandNames, args) {
  if (!commandNames || !typeof commandNames === 'object' || typeof commandNames.forEach !== 'function') {
    return;
  }

  var result = Promise.resolve();

  commandNames.forEach(function (commandName) {
    result = result
      .then(function () {
        return executeCommand(commandName, args);
      });
  });

  return result;
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
        return Promise.resolve()
          .then(function () {
            if (command.commandDefinition.before) {
              logger.info('Executing before scripts for `' + command.name + '`');
              return executeCommands(command.commandDefinition.before, args)
                .then(function () {
                  logger.info('Before scripts for `' + command.name + '` sucessfully executed');
                });
            }
          })
          .then(function () {
            logger.info('Executing core for `' + command.name + '`');
            return Promise.resolve()
              .then(function () {
                command.commandDefinition.execute.apply(this, args);
              })
              .catch(function (error) {
                logger.error('Command `' + command.name + '` ended with an error');
                logger.error(error.stack);
                throw error;
              });
          })
          .then(function () {
            if (command.commandDefinition.after) {
              logger.info('Executing after scripts for `' + command.name + '`');
              return executeCommands(command.commandDefinition.after, args)
                .then(function () {
                  logger.info('After scripts for `' + command.name + '` sucessfully executed');
                });
            }
          })
          .then(function () {
            logger.success('Command `' + command.name + '` sucessfully executed');
          });
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

  return exposedCommands[commandName](args);
};

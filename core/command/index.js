var path = require('path');
var logger = require('../util/logger')('COMMAND');
var makeConfig = require('../util/makeConfig');

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
  'bless',
  'clean',
  'compare',
  'echo',
  'genConfig',
  'init',
  'openReport',
  'reference',
  'report',
  'start',
  'stop',
  'test'
];

/* Commands that are only exposed to higher levels */
var exposedCommandNames = [
  'genConfig',
  'reference',
  'test',
  'bless',
  'start',
  'stop',
  'openReport',
  'echo'
];

/* Used to convert an array of objects {name, execute} to a unique object {[name]: execute} */
function toObjectReducer (object, command) {
  object[command.name] = command.execute;
  return object;
}

function executeCommand (commandName, config) {
  if (typeof commandName === 'string' && commands.hasOwnProperty(commandName)) {
    return commands[commandName](config);
  } else {
    logger.warn('The command `' + commandName + '` does not exist');
    return Promise.resolve();
  }
}

function executeCommands (commandNames, config) {
  if (!commandNames || !typeof commandNames === 'object' || typeof commandNames.forEach !== 'function') {
    return;
  }

  var promises = commandNames.map(function (commandName) {
    return Promise.resolve()
      .then(function () {
        return executeCommand(commandName, config);
      });
  });

  return Promise.all(promises);
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
      execute: function execute (config) {
        return Promise.resolve()
          .then(function () {
            if (command.commandDefinition.before) {
              logger.info('Executing before scripts for `' + command.name + '`');
              return executeCommands(command.commandDefinition.before, config)
                .then(function () {
                  logger.info('Before scripts for `' + command.name + '` sucessfully executed');
                });
            }
          })
          .then(function () {
            logger.info('Executing core for `' + command.name + '`');
            return Promise.resolve()
              .then(function () {
                return command.commandDefinition.execute(config);
              })
              .catch(function (error) {
                logger.error('Command `' + command.name + '` ended with an error');
                logger.error(error, error.stack);
                throw error;
              });
          })
          .then(function () {
            if (command.commandDefinition.after) {
              logger.info('Executing after scripts for `' + command.name + '`');
              return executeCommands(command.commandDefinition.after, config)
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

function execute (commandName, baseConfig, isConfigCompleted) {
  if (!exposedCommands.hasOwnProperty(commandName)) {
    if (commandName.charAt(0) === '_' && commands.hasOwnProperty(commandName.substring(1))) {
      commandName = commandName.substring(1);
    } else {
      throw new Error('The command `' + commandName + '` is not exposed publicly.');
    }
  }

  var config = isConfigCompleted ? baseConfig : makeConfig(baseConfig);
  return commands[commandName](config);
}

module.exports = execute;

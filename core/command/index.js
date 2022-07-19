const path = require('path');
const _ = require('lodash');
const logger = require('../util/logger')('COMMAND');

/*
 * Each file included in this folder (except `index.js`) is a command and must export the following object
 * {
 *   execute: (...args) => void  | command itself
 * }
 *
 * The execute function should not have much logic
 */

/* Each and every command defined, including commands used in before/after */
const commandNames = [
  'init',
  'remote',
  'openReport',
  'reference',
  'report',
  'test',
  'approve',
  'version',
  'stop'
];

/* Commands that are only exposed to higher levels */
const exposedCommandNames = [
  'init',
  'remote',
  'reference',
  'test',
  'openReport',
  'approve',
  'version',
  'stop'
];

/* Used to convert an array of objects {name, execute} to a unique object {[name]: execute} */
function toObjectReducer (object, command) {
  object[command.name] = command.execute;
  return object;
}

const commands = commandNames
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
        config.perf[command.name] = { started: new Date() };
        logger.info('Executing core for "' + command.name + '"');

        let promise = command.commandDefinition.execute(config);

        // If the command didn't return a promise, assume it resolved already
        if (!promise) {
          logger.error('Resolved already:' + command.name);
          promise = Promise.resolve();
        }

        // Do the catch separately or the main runner
        // won't be able to catch it a second time
        promise.catch(function (error) {
          const perf = (new Date() - config.perf[command.name].started) / 1000;
          logger.error('Command "' + command.name + '" ended with an error after [' + perf + 's]');
          logger.error(error);
        });

        return promise.then(function (result) {
          if (/openReport/.test(command.name)) {
            return;
          }
          const perf = (new Date() - config.perf[command.name].started) / 1000;
          logger.success('Command "' + command.name + '" successfully executed in [' + perf + 's]');
          return result;
        });
      }
    };
  })
  .reduce(toObjectReducer, {});

const exposedCommands = exposedCommandNames
  .filter(function commandIsDefined (commandName) {
    return _.has(commands, commandName);
  })
  .map(function (commandName) {
    return {
      name: commandName,
      execute: commands[commandName]
    };
  })
  .reduce(toObjectReducer, {});

function execute (commandName, config) {
  if (!_.has(exposedCommands, commandName)) {
    if (commandName.charAt(0) === '_' && _.has(commands, commandName.substring(1))) {
      commandName = commandName.substring(1);
    } else {
      throw new Error('The command "' + commandName + '" is not exposed publicly.');
    }
  }

  return commands[commandName](config);
}

module.exports = execute;

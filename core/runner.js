var executeCommand = require('./command/');
var makeConfig = require('./util/makeConfig');

module.exports = function (command, options) {
  var config = makeConfig(command, options);
  return executeCommand(command, config);
};

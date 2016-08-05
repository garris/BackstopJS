module.exports = {
  before: ['clean', 'bless'],
  execute: function (config) {
    var executeCommand = require('./index');
    return executeCommand('_test', config, true);
  }
};

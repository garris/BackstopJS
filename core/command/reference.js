module.exports = {
  before: ['clean', 'bless'],
  execute: function () {
    var executeCommand = require('./index');
    return executeCommand('_test');
  }
};

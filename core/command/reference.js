module.exports = {
  execute: function (config) {
    var executeCommand = require('./index');

    return executeCommand('_clean', config, true).then(function () {
      return executeCommand('_bless', config, true);
    }).then(function () {
      return executeCommand('_test', config, true);
    });
  }
};

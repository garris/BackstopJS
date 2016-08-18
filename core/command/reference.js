var createBitmaps = require('../util/createBitmaps');

module.exports = {
  execute: function (config) {
    var executeCommand = require('./index');

    return executeCommand('_clean', config, true).then(function () {
      return createBitmaps(config, true).then(function() {
        console.log('\nRun `$ backstop test` to generate diff report.\n');
      });
    });
  }
};

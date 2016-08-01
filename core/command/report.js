var paths = require('../util/paths');

module.exports = {
  before: ['start'],
  execute: function () {
    var executeCommand = require('./index');

    if (!paths.report || paths.report.indexOf('browser') > -1) {
      setTimeout(function () {
        executeCommand('_openReport');
      }, 1000);
    }

    if (!paths.report || paths.report.indexOf('CLI') > -1) {
      setTimeout(function () {
        executeCommand('_compare');
      }, 500);
    }
  }
};

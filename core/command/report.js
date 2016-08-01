var paths = require('../util/paths');
var Promise = require('es6-promise').Promise;

module.exports = {
  before: ['start'],
  execute: function () {
    var executeCommand = require('./index');

    var promises = [];

    if (!paths.report || paths.report.indexOf('browser') > -1) {
      promises.push(executeCommand('_openReport'));
    }

    if (!paths.report || paths.report.indexOf('CLI') > -1) {
      promises.push(executeCommand('_compare'));
    }

    return Promise.all(promises);
  }
};

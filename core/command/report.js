var Promise = require('es6-promise').Promise;

module.exports = {
  before: ['start'],
  execute: function (config) {
    var executeCommand = require('./index');

    var promises = [];

    if (!config.report || config.report.indexOf('browser') > -1) {
      promises.push(executeCommand('_openReport', config, true));
    }

    if (!config.report || config.report.indexOf('CLI') > -1) {
      promises.push(executeCommand('_compare', config, true));
    }

    return Promise.all(promises);
  }
};

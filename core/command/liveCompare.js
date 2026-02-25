const createComparisonBitmaps = require('../util/createComparisonBitmaps');
const { shouldRunDocker, runDocker } = require('../util/runDocker');

module.exports = {
  execute: function (config) {
    const executeCommand = require('./index');
    if (shouldRunDocker(config)) {
      return runDocker(config, 'liveCompare')
        .then(function () {
          if (config.openReport && config.report && config.report.indexOf('browser') > -1) {
            executeCommand('_openReport', config);
          }
        });
    } else {
      return createComparisonBitmaps(config).then(function () {
        return executeCommand('_report', config);
      });
    }
  }
};

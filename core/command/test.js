var createBitmaps = require('../util/createBitmaps');

// This task will generate a date-named directory with DOM screenshot files as specified in `./capture/config.json` followed by running a report.
// NOTE: If there is no bitmaps_reference directory or if the bitmaps_reference directory is empty then a new batch of reference files will be generated in the bitmaps_reference directory.  Reporting will be skipped in this case.
module.exports = {
  execute: function (config) {
    return createBitmaps(config, false).then(function () {
      var executeCommand = require('./index');
      return executeCommand('_report', config);
    });
  }
};

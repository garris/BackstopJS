const createBitmaps = require('../util/createBitmaps');
const fs = require('../util/fs');
const logger = require('../util/logger')('clean');
const { shouldRunDocker, runDocker } = require('../util/runDocker');

module.exports = {
  execute: function (config) {
    if (shouldRunDocker(config)) {
      return runDocker(config, 'reference');
    } else {
      var firstStep;
      // do not remove reference directory if we are in incremental mode
      if (config.args.filter || config.args.i) {
        firstStep = Promise.resolve();
      } else {
        firstStep = fs.remove(config.bitmaps_reference).then(function () {
          logger.success(config.bitmaps_reference + ' was cleaned.');
        });
      }

      return firstStep.then(function () {
        return createBitmaps(config, true);
      }).then(function () {
        console.log('\nRun `$ backstop test` to generate diff report.\n');
      });
    }
  }
};

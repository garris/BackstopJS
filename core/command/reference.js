var createBitmaps = require('../util/createBitmaps');
var fs = require('../util/fs');
var logger = require('../util/logger')('clean');

module.exports = {
  execute: function (config) {
    var firstStep;

    // Remove existing references only if we must generate all of them
    if (!config.args.filter) {
      firstStep = fs.remove(config.bitmaps_reference).then(function () {
        logger.success('bitmaps_reference was cleaned.');
      });
    } else {
      firstStep = Promise.resolve();
    }

    return firstStep.then(function () {
      return createBitmaps(config, true);
    }).then(function () {
      console.log('\nRun `$ backstop test` to generate diff report.\n');
    });
  }
};

var paths = require('./paths');

module.exports = function getCasperArgs (tests) {
  var args = [];
  if (/slimer/.test(paths.engine)) {
    args = ['--engine=slimerjs'];
  }

  if (paths.casperFlags) {
    if (/--engine=/.test(paths.casperFlags.toString())) {
      args = paths.casperFlags; // casperFlags --engine setting takes presidence -- replace if found.
    } else {
      args = args.concat(paths.casperFlags);
    }
  }

  return tests.concat(args);
};

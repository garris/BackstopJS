module.exports = function getCasperArgs (config, tests) {
  var args = [];
  if (/slimer/.test(config.engine)) {
    args = ['--engine=slimerjs'];
  }

  if (config.casperFlags) {
    if (/--engine=/.test(config.casperFlags.toString())) {
      args = config.casperFlags; // casperFlags --engine setting takes presidence -- replace if found.
    } else {
      args = args.concat(config.casperFlags);
    }
  }

  return tests.concat(args);
};

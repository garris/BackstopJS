var path = require('path');
var spawn = require('child_process').spawn;
var isWin = require('./isWin');
var findExecutable = require('./findExecutable');
var logger = require('./logger')('casper');

function getCasperArgs (config, tests) {
  var args = [];
  if (/slimer/.test(config.engine)) {
    args = ['--engine=slimerjs'];
  }

  if (config.casperFlags) {
    if (/--engine=/.test(config.casperFlags.toString())) {
      args = config.casperFlags; // casperFlags --engine setting takes precedence -- replace if found.
    } else {
      args = args.concat(config.casperFlags);
    }
  }

  return tests.concat(args);
}

module.exports = function (config, tests) {
  var casperArgs = getCasperArgs(config, tests);

  logger.info('Running CasperJS with: ' + casperArgs.join(', '));

  process.env.PHANTOMJS_EXECUTABLE = findExecutable('phantomjs-prebuilt', 'phantomjs');

  var casperProcess = findExecutable('casperjs', 'casperjs');
  var casperChild = spawn(casperProcess, casperArgs, {cwd: config.customBackstop});

  casperChild.stdout.on('data', function (data) {
    var lines = data.toString().slice(0, -1).split('\n');
    for (var i = 0; i < lines.length; i++)
    {
      logger.info(lines[i]);
    }
    //console.log(prefix, data.toString().slice(0, -1).split('\n').join('\n' + prefix)); // Remove \n
  });

  casperChild.stderr.on('data', function (data) {
    var lines = data.toString().slice(0, -1).split('\n');
    for (var i = 0; i < lines.length; i++)
    {
      logger.error(lines[i]);
    }
    //console.error(prefix, data.toString().slice(0, -1).split('\n').join('\n' + prefix)); // Remove \n
  });

  return casperChild;
};

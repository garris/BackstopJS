var path = require('path');
var spawn = require('child_process').spawn;
var isWin = require('./isWin');

function getCasperArgs(config, tests) {
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

  console.log('\nRunning CasperJS with: ', casperArgs);

  process.env.PHANTOMJS_EXECUTABLE = path.join(config.backstop, 'node_modules/.bin/phantomjs');

  var casperProcess = path.join(config.backstop, 'node_modules/.bin/casperjs') + (isWin ? '.cmd' : '');
  var casperChild = spawn(casperProcess, casperArgs, {cwd: config.customBackstop});

  var prefix = 'CasperJS: ';
  casperChild.stdout.on('data', function (data) {
    console.log(prefix, data.toString().slice(0, -1).split('\n').join('\n' + prefix)); // Remove \n
  });

  casperChild.stderr.on('data', function (data) {
    console.error(prefix, data.toString().slice(0, -1).split('\n').join('\n' + prefix)); // Remove \n
  });

  return casperChild;
};

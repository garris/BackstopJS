var spawn = require('child_process').spawn;
var findExecutable = require('./findExecutable');

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

  if (config.args.user && config.args.password) {
    args = args.concat(['--user=' + config.args.user, '--password=' + config.args.password]);
  }

  return tests.concat(args);
}

module.exports = function (config, tests) {
  var casperArgs = getCasperArgs(config, tests);
  if (config.captureConfigFileName) {
    casperArgs[casperArgs.length] = '--captureConfigFileName=' + config.captureConfigFileName;
  }

  console.log('\nRunning CasperJS with: ', casperArgs);

  process.env.PHANTOMJS_EXECUTABLE = findExecutable('phantomjs-prebuilt', 'phantomjs');

  var casperProcess = findExecutable('casperjs', 'casperjs');
  var casperChild = spawn(casperProcess, casperArgs, {cwd: config.projectPath});

  var prefix = 'CasperJS: ';
  casperChild.stdout.on('data', function (data) {
    console.log(prefix, data.toString().slice(0, -1).split('\n').join('\n' + prefix)); // Remove \n
  });

  casperChild.stderr.on('data', function (data) {
    console.error(prefix, data.toString().slice(0, -1).split('\n').join('\n' + prefix)); // Remove \n
  });

  return casperChild;
};

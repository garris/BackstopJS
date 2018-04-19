const path = require('path');
const childProcess = require('child_process');
const util = require('util');

// Catch errors from failing promises
process.on('unhandledRejection', function (error) {
  console.error(error && error.stack);
  process.exit(3);
});

const child = childProcess.spawn(
  path.join(__dirname, '../../cli/index.js'),
  ['test', '--config=backstop_features'],
  {cwd: path.join(__dirname, '../configs')}
);

const requiredStdout = [
  'Element not found for capturing: .monkey',
  'report | 44 Passed',
  'report | 14 Failed'
];

const allowedStdErr = [
  'Possible EventEmitter memory leak detected.'
];

const missingStdOut = {};
requiredStdout.forEach(function (el) { missingStdOut[el] = false; });

child.stdout.on('data', function (buf) {
  const line = String(buf);
  util.print(line);
  const key = line.trim();
  if (missingStdOut[key] === false) delete missingStdOut[key];
});

const stdErrs = [];
child.stderr.on('data', function (buf) {
  const line = String(buf);
  util.print('StdErr:', line);
  if (!allowedStdErr.filter(allowed => line.includes(allowed))) {
    stdErrs.push(line.trim());
  }
});

child.on('close', function (code) {
  const problems = [];
  const missing = requiredStdout.filter(function (el) { return missingStdOut[el]; });
  if (missing.length !== 0) {
    problems.push('The following line were expected in smoke test std output, but were not found:');
    problems.push(...missing);
  }

  if (stdErrs.length !== 0) {
    problems.push('Unexpected output on Std Error of smoke test:');
    problems.push(...stdErrs);
  }

  if (code !== 1) {
    problems.push(`Expected exit code 1, but it was ${code}`);
  }
  if (problems.length > 0) {
    console.error('Smoke test FAILED:');
    problems.forEach(line => console.error(line));
    process.exit(1);
  } else {
    console.error('Smoke test succeeded.');
    process.exit(0);
  }
});

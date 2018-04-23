const path = require('path');
const childProcess = require('child_process');
const util = require('util');
const fs = require('fs');

// Catch errors from failing promises
process.on('unhandledRejection', function (error) {
  console.error(error && error.stack);
  process.exit(3);
});

const mustReplace = (str, find, replace) => {
  const newStr = str.replace(find, replace);
  if (str === newStr) {
    throw new Error(`The file backstop_features.js should have contained the string ${find}. You probably need to udpate smoke_test.js`);
  }
  return newStr;
};

const ciMode = process.argv.length > 2 && process.argv[2] === 'ci';
let configFile = 'backstop_features';
if (ciMode) {
  let contents = fs.readFileSync(path.join(__dirname, '../configs/backstop_features.js'), {encoding: 'utf8'});
  contents = mustReplace(contents, `report: ['browser']`, `report: ['CI']`);
  contents = mustReplace(contents, 'engineOptions: {}', `engineOptions: {args: ['--no-sandbox', '--enable-font-antialiasing']}`);
  fs.writeFileSync(path.join(__dirname, '../configs/backstop_ci.js'), contents);
  configFile = 'backstop_ci.js';
}

const child = childProcess.spawn(
  path.join(__dirname, '../../cli/index.js'),
  ['test', `--config=${configFile}`],
  {cwd: path.join(__dirname, '../configs')}
);

const requiredStdout = [
  'Element not found for capturing: .monkey',
  'report | 0 Failed'
];

const allowedStdErr = [
  'Possible EventEmitter memory leak detected.'
];

let missingStdOut = [...requiredStdout];

child.stdout.on('data', function (buf) {
  const line = String(buf);
  util.print(line);
  const key = line.trim();
  missingStdOut = missingStdOut.filter(el => !key.includes(el));
});

const stdErrs = [];
child.stderr.on('data', function (buf) {
  const line = String(buf);
  util.print('StdErr:', line);
  if (allowedStdErr.filter(allowed => line.includes(allowed)).length === 0) {
    stdErrs.push(line.trim());
  }
});

child.on('close', function (code) {
  const problems = [];
  if (missingStdOut.length !== 0) {
    problems.push('The following line were expected in smoke test std output, but were not found:');
    problems.push(...missingStdOut);
  }

  if (stdErrs.length !== 0) {
    problems.push('Unexpected output on Std Error of smoke test:');
    problems.push(...stdErrs);
  }

  if (code !== 1) {
    problems.push(`Expected exit code 1, but it was ${code}`);
  }
  if (ciMode) {
    fs.unlinkSync(path.join(__dirname, '../configs/backstop_ci.js'));
  }

  if (problems.length > 0) {
    problems.forEach(line => console.error(line));
    console.error('Smoke test FAILED:');
    process.exit(1);
  } else {
    console.error('Smoke test succeeded.');
    process.exit(0);
  }
});

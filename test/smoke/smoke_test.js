const path = require('path');
const childProcess = require('child_process');
const util = require('util');
const fs = require('fs');

// Catch errors from failing promises
process.on('unhandledRejection', function (error) {
  console.error(error && error.stack);
  process.exit(3);
});

const configsDir = path.normalize(path.join(__dirname, '../configs'));

const extraSpawnOpts = {};
const ciMode = process.argv.includes('ci');
if (ciMode) {
  extraSpawnOpts.env = { ...process.env, BACKSTOP_CI_MODE: '1' };
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSmokeTest (description, commands) {
  const child = childProcess.spawn(commands[0], commands.slice(1),
    { cwd: configsDir, ...extraSpawnOpts }
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

  const code = await new Promise(resolve => child.on('close', resolve));

  const problems = [];
  if (missingStdOut.length !== 0) {
    problems.push('The following line were expected in smoke test std output, but were not found:');
    problems.push(...missingStdOut);
  }

  if (stdErrs.length !== 0) {
    problems.push('Unexpected output on Std Error of smoke test:');
    problems.push(...stdErrs);
  }

  if (code !== 0) {
    problems.push(`Expected exit code 0, but it was ${code}`);
  }

  if (problems.length > 0) {
    problems.forEach(line => console.error(line));
    throw new Error(`${description} smoke test FAILED:\n`);
  } else {
    console.log(`${description} smoke test succeeded.`);
  }
}

async function runSmokeTests () {
  const isMac = process.platform === 'darwin';

  await runSmokeTest(isMac ? 'Mac' : 'Linux', [
    '../../cli/index.js',
    'test', '--config=backstop_features']);

  if (ciMode && isMac) {
    const linuxNodeModulesDir = path.join(configsDir, 'linux/node_modules');

    if (!fs.existsSync(linuxNodeModulesDir)) {
      console.log('\n\nAbout to build a container in which we will run the Linux smoke tests');
      console.log('This will take a while -- you might want to get a cup of coffee.');
      console.log('='.repeat(50));
      await sleep(4000);
    }

    await runSmokeTest('Linux Docker', ['../smoke/docker_smoke.sh']);
  }
}

runSmokeTests();

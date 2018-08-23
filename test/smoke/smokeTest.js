const path = require('path');
const childProcess = require('child_process');
const fs = require('fs');
const SmokeTestErrorTracker = require('./errorTracker.js');

const requiredStdout = [
  'Element not found for capturing: .monkey',
  'report | 0 Failed'
];

const allowedStdErr = [
  'Possible EventEmitter memory leak detected.'
];

// Catch errors from failing promises
process.on('unhandledRejection', function (error) {
  console.error(error && error.stack);
  process.exit(3);
});

const configsDir = path.normalize(path.join(__dirname, '../configs'));

const processEnv = Object.assign({}, process.env);
const ciMode = process.argv.includes('ci');
if (ciMode) {
  processEnv.BACKSTOP_CI_MODE = '1';
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSmokeTest (description, commands) {
  const child = childProcess.spawn(commands[0], commands.slice(1),
    { cwd: configsDir, env: processEnv }
  );

  const errorTracker = new SmokeTestErrorTracker(requiredStdout, allowedStdErr);

  child.stdout.on('data', function (buf) {
    errorTracker.recordStdOut(buf);
  });

  child.stderr.on('data', function (buf) {
    errorTracker.recordStdErr(buf);
  });

  const code = await new Promise(resolve => child.on('close', resolve));

  const problems = errorTracker.getProblemsAfterRunning();

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
      await sleep(2000);
    }

    await runSmokeTest('Linux Docker', ['../smoke/launch_docker_smoke.sh']);
  }
}

runSmokeTests();

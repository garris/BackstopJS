const { spawn } = require('child_process');
const version = require('../../package').version;

module.exports.shouldRunDocker = (config) => config.args.docker;

module.exports.runDocker = (config, backstopCommand) => {
  if (config.args.docker) {
    // 0th element is node, 1st is backstop, 2nd may be command or an option like --config
    const args = process.argv.slice(2);
    args.splice(args.indexOf(backstopCommand), 1);

    const passAlongArgs = args
      .join('" "') // in case of spaces in a command
      .replace(/--docker/, '--moby');

    // When calling BackstopJS from node config props will be overridden by the passed config object. e.g. backstop('test', {thisProp:'will be passed to config.args'})
    // NOTE: passing config file name is supported -- passing actual config data is not supported.
    let configArgs = '';
    if (config.args && !config.args._) {
      for (var prop in config.args) {
        configArgs += ` "--${prop}=${config.args[prop]}"`;
      }
      configArgs = configArgs.replace(/--docker/, '--moby');
    }

    const DOCKER_COMMAND = `docker run --rm -it --mount type=bind,source="${process.cwd()}",target=/src backstopjs/backstopjs:${version} ${backstopCommand}${configArgs} "${passAlongArgs}"`;
    console.log('Delegating command to Docker...', DOCKER_COMMAND);

    return new Promise((resolve, reject) => {
      const dockerProcess = spawn(DOCKER_COMMAND, { stdio: 'inherit', shell: true });
      dockerProcess.on('error', err => reject(err));
      dockerProcess.on('exit', function (code, signal) {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${DOCKER_COMMAND} returned ${code}`));
        }
      });
    });
  }
};

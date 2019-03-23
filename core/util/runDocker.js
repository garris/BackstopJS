const { spawn } = require('child_process');
const version = require('../../package').version;

const DEFAULT_DOCKER_COMMAND_TEMPLATE = 'docker run --rm -it --mount type=bind,source="{cwd}",target=/src backstopjs/backstopjs:{version} {backstopCommand} {args}';

module.exports.shouldRunDocker = (config) => config.args.docker;

module.exports.runDocker = (config, backstopCommand) => {
  if (config.args.docker) {
    // 0th element is node, 1st is backstop, 2nd may be command or an option like --config
    const args = process.argv.slice(2);
    args.splice(args.indexOf(backstopCommand), 1);

    const passAlongArgs = args
      .map(arg => `"${arg}"`) // in case of spaces in a command
      .join(' ')
      .replace(/--docker/, '--moby');

    // When calling BackstopJS from node config props will be overridden by the passed config object. e.g. backstop('test', {thisProp:'will be passed to config.args'})
    // NOTE: passing config file name is supported -- passing actual config data is not supported.
    let configArgs = '';
    if (config.args && !config.args._) {
      configArgs = Object.keys(config.args)
        .map(prop => `"--${prop}=${config.args[prop]}"`)
        .join(' ')
        .replace(/--docker/, '--moby');
    }

    const backstopArgs = [configArgs, passAlongArgs]
      .filter(args => args)
      .join(' ');

    const dockerCommandTemplate = config.dockerCommandTemplate || DEFAULT_DOCKER_COMMAND_TEMPLATE;

    const dockerCommand = dockerCommandTemplate
      .replace(/{cwd}/, process.cwd())
      .replace(/{version}/, version)
      .replace(/{backstopCommand}/, backstopCommand)
      .replace(/{args}/, backstopArgs);

    console.log('Delegating command to Docker...', dockerCommand);

    return new Promise((resolve, reject) => {
      const dockerProcess = spawn(dockerCommand, { stdio: 'inherit', shell: true });
      dockerProcess.on('error', err => reject(err));
      dockerProcess.on('exit', function (code, signal) {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${dockerCommand} returned ${code}`));
        }
      });
    });
  }
};

const { spawn } = require('child_process');
const version = require('../../package').version;
const fs = require('./fs');

const DEFAULT_DOCKER_COMMAND_TEMPLATE = 'docker run --rm -it --mount type=bind,source="{cwd}",target=/src backstopjs/backstopjs:{version} {backstopCommand} {args}';

module.exports.shouldRunDocker = (config) => config.args.docker;

module.exports.runDocker = async (config, backstopCommand) => {
  if (config.args.docker) {
    // 0th element is node, 1st is backstop, 2nd may be command or an option like --config
    const args = process.argv.slice(2);
    args.splice(args.indexOf(backstopCommand), 1);

    const passAlongArgs = args
      .map(arg => `"${arg}"`) // in case of spaces in a command
      .join(' ')
      .replace(/--docker/, '--moby');

    // We cannot pass object literals directly to Docker, so if the config is an object (and not a file path) we will output the config to a temporary file.
    const tmpConfigFile = 'backstop.config-for-docker.json';

    // When calling BackstopJS from node config props will be overridden by the passed config object. e.g. backstop('test', {thisProp:'will be passed to config.args'})
    let configArgs = '';
    if (config.args && !config.args._) {
      const argPromises = Object.keys(config.args)
        .filter(prop => config.args[prop])
        .map(async prop => {
          if (prop === 'config' && typeof config.args[prop] === 'object') {
            // If config is an object, export it to a json file
            await fs.writeFile(tmpConfigFile, JSON.stringify(config.args[prop]));
            config.args[prop] = tmpConfigFile;
          }

          return `"--${prop}=${config.args[prop]}"`;
        });

      configArgs = await Promise.all(argPromises).then((str) => {
        return str.join(' ').replace(/--docker/, '--moby');
      });
    }

    const backstopArgs = [configArgs, passAlongArgs]
      .filter(args => args)
      .join(' ');

    const dockerCommandTemplate = config.dockerCommandTemplate || DEFAULT_DOCKER_COMMAND_TEMPLATE;

    const dockerCommand = dockerCommandTemplate
      .replace(/{cwd}/g, process.cwd())
      .replace(/{version}/, version)
      .replace(/{backstopCommand}/, backstopCommand)
      .replace(/{args}/, backstopArgs);

    console.log('Delegating command to Docker...', dockerCommand);

    return new Promise((resolve, reject) => {
      const dockerProcess = spawn(dockerCommand, { stdio: 'inherit', shell: true });
      dockerProcess.on('error', err => reject(err));
      dockerProcess.on('exit', async function (code, signal) {
        if (!config.args.debug && config.args.config === tmpConfigFile) {
          await fs.unlink(tmpConfigFile);
        }

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${dockerCommand} returned ${code}`));
        }
      });
    });
  }
};

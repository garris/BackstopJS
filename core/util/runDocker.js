module.exports.shouldRunDocker = (config) => config.args.docker;

module.exports.runDocker = (config, backstopCommand) => {
  if (config.args.docker) {
    const passAlongArgs = process.argv
                  .slice(3)
                  .join('" "') // in case of spaces in a command
                  .replace(/--docker/, '--moby');
    
    // Calling BackstopJS from node will add a config.args to the config object.
    // NOTE: passing config file name is supported -- passing actual config data is not supported.
    let configArgs = '';
    if (config.args) {    
      for (var prop in config.args) {
        configArgs += ` "--${prop}=${config.args[prop]}"`
      }
      configArgs = configArgs.replace(/--docker/, '--moby');
    }

    const DOCKER_COMMAND = `docker run --rm -it --mount type=bind,source="${process.cwd()}",target=/src backstopjs/backstopjs ${backstopCommand}${configArgs} "${passAlongArgs}"`;
    const { spawn } = require('child_process');
    console.log('Delegating command to Docker...', DOCKER_COMMAND);

    return new Promise((resolve, reject) => {
      const dockerProcess = spawn(DOCKER_COMMAND, {stdio: 'inherit', shell: true});
      dockerProcess.on('exit', function (code, signal) {
        if (code === 0) {
          resolve();
        } else {
          reject('');
        }
      });
    });
  }
};

const logger = require('../util/logger')('remote');
const path = require('path');
const { spawn } = require('child_process');
const getRemotePort = require('../util/getRemotePort');
const ssws = require.resolve('super-simple-web-server');

module.exports = {
  execute: function (config) {
    const MIDDLEWARE_PATH = path.resolve(config.backstop, 'remote');
    const projectPath = path.resolve(config.projectPath);

    return new Promise(function (resolve, reject) {
      const port = getRemotePort();
      const args = [
        ssws,
        projectPath,
        MIDDLEWARE_PATH,
        `--config=${config.backstopConfigFileName}`
      ];
      const env = { SSWS_HTTP_PORT: port };

      logger.log(
        `Starting remote with: ${process.execPath} ${args.join(' ')} with env ${JSON.stringify(env)}`
      );

      const child = spawn(process.execPath, args, {
        env: { ...process.env, ...env },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      child.on('error', (error) => {
        if (error) {
          logger.log('Error running backstop remote:', error);
        }
      });

      child.stdout.on('data', logger.log);

      child.stdout.on('close', data => {
        logger.log('Backstop remote connection closed.', data);
        resolve(data);
      });
    });
  }
};

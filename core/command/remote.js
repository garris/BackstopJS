const logger = require('../util/logger')('remote');
const path = require('path');
const { exec } = require('child_process');
const getRemotePort = require('../util/getRemotePort');
const ssws = require.resolve('super-simple-web-server');

function wrapPath(pathStr) {
  if (!pathStr.includes('"')) {
    return `"${pathStr}"`;
  }

  // No windows below this point, since double-quotes are not allowed in paths.

  if (!pathStr.includes("'")) {
    return `'${pathStr}'`;
  }

  return `"${pathStr.replace(/"/g, '\\"')}"`;
}

module.exports = {
  execute: function (config) {
    const MIDDLEWARE_PATH = path.resolve(config.backstop, 'remote');
    const projectPath = path.resolve(config.projectPath);

    return new Promise(function (resolve, reject) {
      const port = getRemotePort();
      const commandStr = `node ${wrapPath(ssws)} ${wrapPath(projectPath)} ${wrapPath(MIDDLEWARE_PATH)} --config=${wrapPath(config.backstopConfigFileName)}`;
      const env = { SSWS_HTTP_PORT: port };

      logger.log(`Starting remote with: ${commandStr} with env ${JSON.stringify(env)}`);

      const child = exec(commandStr, { env: { ...env, PATH: process.env.PATH } }, (error) => {
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

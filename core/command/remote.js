const logger = require('../util/logger')('remote');
const path = require('path');
const { exec } = require('child_process');
const resolver = require('resolve');
const ssws = resolver.sync('super-simple-web-server', { basedir: __dirname });

module.exports = {
  execute: function (config) {
    const MIDDLEWARE_PATH = path.resolve(config.backstop, 'remote');
    const projectPath = path.resolve(config.projectPath);

    return new Promise(function (resolve, reject) {
      let commandStr = `node ${ssws} ${projectPath} ${MIDDLEWARE_PATH} --config=${config.backstopConfigFileName}`;

      logger.log(`Starting remote with: ${commandStr}`);

      const child = exec(commandStr);

      child.stdout.on('data', logger.log);

      child.stdout.on('close', data => {
        logger.log('Backstop remote connection closed.', data);
        resolve(data);
      });
    });
  }
};

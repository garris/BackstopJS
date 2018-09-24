const logger = require('../util/logger')('remote');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
  execute: function (config) {
    logger.log('Starting remote.');
    return new Promise(function (resolve, reject) {
      const ssws = path.resolve(config.backstop, 'node_modules', 'super-simple-web-server', 'index.js');
      const child = exec(`node ${ssws} ${path.resolve(config.projectPath)}`);
      child.stdout.on('data', (data) => {
        // if (/someOutputWhichWouldCloseConnection/.test(data)) {
        //   resolve();
        // }
        logger.log(data);
      });
      child.stdout.on('close', (data) => {
        logger.log('Server connection closed.', data);
        resolve(data);
      });
    });
  }
};

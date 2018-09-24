const open = require('opn');
const logger = require('../util/logger')('remote');
const path = require('path');
const { exec } = require('child_process')

module.exports = {
  execute: async function (config) {
    logger.log('Starting remote.');

    const ssws = path.resolve(config.backstop,'node_modules','super-simple-web-server','index.js');
    const child = exec(`node ${ssws} ${path.resolve(config.projectPath)}`);

    for await (const data of child.stdout) {
      logger.log(data);
    };
  }
};

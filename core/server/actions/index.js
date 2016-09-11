'use strict';

const fs = require('../../util/fs');
const logger = require('../../util/logger')('report');
const executeCommand = require('./../../command/index');

function overrideReferenceFile(referencePath, testPath) {
  return new Promise((resolve) => {
    fs.exists(referencePath).then(function () {
      logger.log('File exists!');

      fs.copy(testPath, referencePath, {clobber: true}).then(function () {
        logger.log('Reference replace by test image');
        resolve();
      });
    });
  })
}

function updateTestPair() {
  const config = require('../temp/config.json');
  return executeCommand('_writeReport', config)
}


module.exports = {
  overrideReferenceFile,
  updateTestPair
};

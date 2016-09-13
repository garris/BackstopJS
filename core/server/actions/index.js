'use strict';

const fs = require('../../util/fs');
const logger = require('../../util/logger')('report');
const config = require('../config.json');
const executeCommand = require('./../../command/index');

function overrideReferenceFile(referencePath, testPath) {
  return new Promise((resolve) => {
    fs.exists(referencePath).then(function () {
      logger.log('File exists!');

      fs.copy(testPath, referencePath, {clobber: true})
        .then(function () {
          logger.log('Reference replace by test image');
          resolve();
        })
        .catch(function(err) {
          console.log(err);
        });
    });
  })
}

function updateTestPair() {
  return executeCommand('_writeReport', config);
}


module.exports = {
  overrideReferenceFile,
  updateTestPair
};

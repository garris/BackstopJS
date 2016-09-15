'use strict';

var fs = require('../../util/fs');
var logger = require('../../util/logger')('report');
var config = require('../config.json');
var executeCommand = require('./../../command/index');

function overrideReferenceFile(referencePath, testPath) {
  return new Promise(function (resolve) {
    fs.exists(referencePath).then(function () {
      logger.log('File exists!');

      fs.copy(testPath, referencePath, {clobber: true})
        .then(function () {
          logger.log('Reference replace by test image');
          resolve();
        })
        .catch(function(err) {
          throw err;
        });
    });
  })
}

function updateTestPair() {
  return executeCommand('_updateReport', config);
}


module.exports = {
  overrideReferenceFile: overrideReferenceFile,
  updateTestPair: updateTestPair
};

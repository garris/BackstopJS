'use strict';

const action = require('../actions');
const path = require('path');
const config = require('../config.json');

module.exports = (app) => {

  app.post('/api/reference/replace', (request, response) => {
    let reference = path.join(config.paths.bitmaps_reference, request.body.reference);
    let test = path.join(config.paths.bitmaps_test, request.body.test);

    // resolve to get the absolute path
    reference = path.resolve(config.customBackstop, reference);
    test = path.resolve(config.customBackstop, test);

    action.overrideReferenceFile(reference, test)
      .then(function () {
        return action.updateTestPair();
      })
      .then(function () {
        response.json({
          reference,
          test
        });
      })
      .catch(function (err) {
        throw err;
      });
  });

};

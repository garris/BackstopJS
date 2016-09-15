'use strict';

var action = require('../actions');
var path = require('path');
var config = require('../config.json');

module.exports = function (app) {

  app.post('/api/reference/replace', function (request, response) {
    var reference = path.join(config.paths.bitmaps_reference, request.body.reference);
    var test = path.join(config.paths.bitmaps_test, request.body.test);

    // resolve to get the absolute path
    reference = path.resolve(config.customBackstop, reference);
    test = path.resolve(config.customBackstop, test);

    action.overrideReferenceFile(reference, test)
      .then(function () {
        return action.updateTestPair();
      })
      .then(function () {
        response.json({
          reference: reference,
          test: test
        });
      })
      .catch(function (err) {
        throw err;
      });
  });

};

'use strict';

module.exports = function (app) {

  app.get('/api/system/stop', function (request, response) {
    process.exit();
  });

};

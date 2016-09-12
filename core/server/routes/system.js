'use strict';

module.exports = (app) => {

  app.get('/api/system/stop', (request, response) => {
    process.exit();
  });

};

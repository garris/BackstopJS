'use strict';

const reference = require('./reference');
const system = require('./system');

module.exports = (app) => {

  reference(app);
  system(app);

};

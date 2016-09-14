'use strict';

var reference = require('./reference');
var system = require('./system');

module.exports = (app) => {

  reference(app);
  system(app);

};

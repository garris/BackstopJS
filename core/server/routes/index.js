'use strict';

var reference = require('./reference');
var system = require('./system');

module.exports = function (app) {

  reference(app);
  system(app);

};

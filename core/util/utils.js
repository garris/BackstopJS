'use strict';

var path = require('path');
var config = require('../server/config.json');

module.exports = {

  toAbsolute: function (pathSegment) {
    if (pathSegment[0] === '/') {
      return pathSegment;
    }
    return path.join(config.customBackstop, pathSegment);
  }

};

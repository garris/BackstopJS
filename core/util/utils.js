'use strict';

var path = require('path');

module.exports = {

  toAbsolute: function (pathSegment) {
    var config = require('../server/config.json');

    if (pathSegment[0] === '/') {
      return pathSegment;
    }
    return path.join(config.customBackstop, pathSegment);
  }

};

const open = require('opn');
const logger = require('../util/logger')('openReport');
const path = require('path');
const http = require('http');

module.exports = {
  execute: function (config) {
    const remoteReportUrl = 'http://127.0.0.1:3000/' + config.compareReportURL;
    return new Promise(function (resolve, reject) {

      // would prefer to ping a http://127.0.0.1:3000/remote with {backstopRemote:ok} response
      http.get(remoteReportUrl, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {data += chunk;});
        resp.on('end', () => {
          logger.log('remoteFound! Opening report.');
          resolve(open(remoteReportUrl, {wait: false}));
        });

      }).on("error", (err) => {
        logger.log("Opening report.","Error: " + err.message);
        resolve(open(path.resolve(config.compareReportURL), {wait: false}))
      });
    });
  }
};

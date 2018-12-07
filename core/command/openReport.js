const open = require('opn');
const logger = require('../util/logger')('openReport');
const path = require('path');
const http = require('http');
const BACKSTOP_REPORT_SIGNATURE_RE = /BackstopJS Report/i;

module.exports = {
  execute: function (config) {
    const remoteReportUrl = `http://127.0.0.1:3000/${config.compareReportURL}?remote`;
    return new Promise(function (resolve, reject) {
      // would prefer to ping a http://127.0.0.1:3000/remote with {backstopRemote:ok} response
      logger.log('Attempting to ping ', remoteReportUrl);
      http.get(remoteReportUrl, (resp) => {
        let data = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
          if (BACKSTOP_REPORT_SIGNATURE_RE.test(data)) {
            logger.log('Remote found. Opening ' + remoteReportUrl);
            resolve(open(remoteReportUrl, { wait: false }));
          } else {
            logger.log('Remote not detected. Opening ' + config.compareReportURL);
            resolve(open(config.compareReportURL, { wait: false }));
          }
        });
      }).on('error', (err) => {
        logger.log('Remote not found. Opening ' + config.compareReportURL, 'Error: ' + err.message);
        resolve(open(path.resolve(config.compareReportURL), { wait: false }));
      });
    });
  }
};

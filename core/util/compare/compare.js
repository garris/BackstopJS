var compareHashes = require('./compare-hash');
var compareResemble = require('./compare-resemble');
var storeFailedDiff = require('./store-failed-diff.js');
var logger = require('./../logger')('compare');

process.on('message', compare);

function compare (data) {
  var {referencePath, testPath, resembleOutputSettings, pair} = data;
  var promise = compareHashes(referencePath, testPath)
    .catch(() => compareResemble(referencePath, testPath, pair.misMatchThreshold, resembleOutputSettings, pair.requireSameDimensions));
  promise
    .then(function (data) {
      pair.diff = data;
      pair.status = 'pass';
      logger.success('OK: ' + pair.label + ' ' + pair.fileName);
      return sendMessage(pair);
    })
    .catch(function (data) {
      pair.diff = data;
      pair.status = 'fail';
      logger.error('ERROR { requireSameDimensions: ' + (data.requireSameDimensions ? 'true' : 'false') + ', size: ' + (data.isSameDimensions ? 'ok' : 'isDifferent') + ', content: ' + data.misMatchPercentage + '%, threshold: ' + pair.misMatchThreshold + '% }: ' + pair.label + ' ' + pair.fileName);

      return storeFailedDiff(testPath, data).then(function (compare) {
        pair.diffImage = compare;
        return sendMessage(pair);
      });
    });
};

function sendMessage (data) {
  process.send(data);
}
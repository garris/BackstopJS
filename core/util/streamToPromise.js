module.exports = function onStreamEnd (stream, result) {
  return new Promise(function (resolve, reject) {
    if (stream.writable) {
      stream.on('finish', function () {
        resolve(result);
      });
    }

    if (stream.readable) {
      stream.on('end', function () {
        resolve(result);
      });
    }

    stream.on('close', function () {
      resolve(result);
    });

    stream.on('error', function (error) {
      reject(error);
    });
  });
};

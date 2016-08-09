module.exports = function onStreamEnd (stream) {
  return new Promise(function (resolve, reject) {
    if (stream.writable) {
      stream.on('finish', function () {
        resolve();
      });
    }

    if (stream.readable) {
      stream.on('end', function () {
        resolve();
      });
    }

    stream.on('close', function () {
      resolve();
    });

    stream.on('error', function (error) {
      reject(error);
    });
  });
};

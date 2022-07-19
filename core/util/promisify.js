
module.exports = function promisify (func) {
  return function () {
    const args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
    return new Promise(function (resolve, reject) {
      args.push(function (err) {
        if (err) {
          reject(err);
          return;
        }

        const args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
        resolve(args.slice(1));
      });
      func.apply(this, args);
    });
  };
};

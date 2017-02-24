module.exports = function (promises) {
  return Promise.all(promises.map(function (promise) {
    return promise.then(function (value) {
      return { state: 'fulfilled', value: value };
    }).catch(function (reason) {
      return { state: 'rejected', reason: reason };
    });
  }));
};

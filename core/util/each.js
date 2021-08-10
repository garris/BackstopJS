module.exports = function each (arr, callback) {
  for (let i in arr) {
    if (arr.hasOwnProperty(i)) {
      callback(arr[i], i, arr);
    }
  }
};

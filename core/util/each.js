module.exports = function each (arr, callback) {
  for (var i in arr) {
    if (arr.hasOwnProperty(i)) {
      callback(arr[i], i, arr);
    }
  }
};

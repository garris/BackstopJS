module.exports = function makeSpaces (length) {
  var i = 0;
  var result = '';
  while (i < length) {
    result += ' ';
    i++;
  }
  return result;
};

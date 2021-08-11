module.exports = function makeSpaces (length) {
  let i = 0;
  let result = '';
  while (i < length) {
    result += ' ';
    i++;
  }
  return result;
};

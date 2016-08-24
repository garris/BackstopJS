function Test (pair) {
  this.pair = pair;
  this.status = 'running';
}

Test.prototype.passed = function () {
  return this.status === 'pass';
};

function Reporter (testSuite) {
  this.testSuite = testSuite;
  this.tests = [];
}

Reporter.prototype.addTest = function (pair) {
  var t = new Test(pair);
  this.tests.push(t);

  return t;
};

Reporter.prototype.passed = function () {
  var count = 0;

  for (var test in this.tests) {
    if (this.tests.hasOwnProperty(test) && this.tests[test].passed()) {
      count++;
    }
  }

  return count;
};

Reporter.prototype.failed = function () {
  var count = 0;

  for (var test in this.tests) {
    if (this.tests.hasOwnProperty(test) && !this.tests[test].passed()) {
      count++;
    }
  }

  return count;
};

module.exports = Reporter;

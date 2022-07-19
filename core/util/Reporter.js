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
  const t = new Test(pair);
  this.tests.push(t);

  return t;
};

Reporter.prototype.passed = function () {
  return this.tests.filter(test => test.passed()).length;
};

Reporter.prototype.failed = function () {
  return this.tests.filter(test => !test.passed()).length;
};

Reporter.prototype.getReport = function () {
  return {
    testSuite: this.testSuite,
    tests: this.tests
  };
};

module.exports = Reporter;

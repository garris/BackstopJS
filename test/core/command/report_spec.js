var mockery = require('mockery');
var assert = require('assert');
var sinon = require('sinon');

describe('core report', function () {
  const config = {
    report: ['json'],
    json_report: '/test',
    compareJsonFileName: '/compareJson',
    compareConfigFileName: '/compareConfig',
    html_report: '/html_report'
  };

  before(function () {
    mockery.enable({ warnOnUnregistered: false });
  });

  after(function () {
    mockery.disable();
  });

  it('generates a json report and a default browser report when config.report specifies json', function () {
    const reporterClass = { failed: () => undefined, passed: () => 'passed', getReport: () => { return { test: 123 }; } };
    const compareMock = sinon.stub().returns(Promise.resolve(reporterClass));
    const loggerMock = () => {
      return { log: sinon.stub(), error: sinon.stub() };
    };
    const writeFileStub = sinon.stub().returns(Promise.resolve());
    const fsMock = { ensureDir: () => Promise.resolve(), writeFile: writeFileStub, copy: () => Promise.resolve() };
    mockery.registerMock('../util/compare/', compareMock);
    mockery.registerMock('../util/logger', loggerMock);
    mockery.registerMock('../util/fs', fsMock);

    var report = require('../../../core/command/report');

    return report.execute(config).then(() => {
      assert.strictEqual(writeFileStub.callCount, 2);
      assert.strictEqual(writeFileStub.calledWith('/compareJson'), true);
      assert.strictEqual(writeFileStub.calledWith('/compareConfig'), true);
    });
  });
});

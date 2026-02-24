const mockery = require('mockery');
const assert = require('assert');
const sinon = require('sinon');

describe('liveCompare command', function () {
  let liveCompare;
  let createComparisonBitmapsStub;
  let executeCommandStub;
  let runDockerStub;

  beforeEach(function () {
    mockery.enable({ warnOnUnregistered: false, warnOnReplace: false, useCleanCache: true });

    // Mock createComparisonBitmaps
    createComparisonBitmapsStub = sinon.stub().returns(Promise.resolve());
    mockery.registerMock('../util/createComparisonBitmaps', createComparisonBitmapsStub);

    // Mock runDocker
    runDockerStub = sinon.stub().returns(Promise.resolve());
    mockery.registerMock('../util/runDocker', {
      shouldRunDocker: sinon.stub().returns(false),
      runDocker: runDockerStub
    });

    // Mock command index
    executeCommandStub = sinon.stub().returns(Promise.resolve());
    mockery.registerMock('./index', executeCommandStub);

    liveCompare = require('../../../core/command/liveCompare');
  });

  afterEach(function () {
    mockery.deregisterAll();
    mockery.disable();
    sinon.restore();
  });

  it('should call createComparisonBitmaps with config', async function () {
    const config = {
      scenarios: [],
      viewports: [],
      compareRetries: 3,
      compareRetryDelay: 5000,
      maxNumDiffPixels: 10
    };

    await liveCompare.execute(config);

    assert(createComparisonBitmapsStub.calledOnce, 'Should call createComparisonBitmaps');
    assert(createComparisonBitmapsStub.calledWith(config), 'Should pass config to createComparisonBitmaps');
  });

  it('should call _report command after createComparisonBitmaps succeeds', async function () {
    const config = { scenarios: [], viewports: [] };

    await liveCompare.execute(config);

    assert(executeCommandStub.calledOnce, 'Should call executeCommand');
    assert(executeCommandStub.calledWith('_report', config), 'Should call _report with config');
  });

  it('should run docker when docker mode is enabled', async function () {
    // Re-setup mocks for docker mode
    mockery.deregisterAll();
    mockery.disable();
    mockery.enable({ warnOnUnregistered: false, warnOnReplace: false, useCleanCache: true });

    createComparisonBitmapsStub = sinon.stub().returns(Promise.resolve());
    mockery.registerMock('../util/createComparisonBitmaps', createComparisonBitmapsStub);

    runDockerStub = sinon.stub().returns(Promise.resolve());
    mockery.registerMock('../util/runDocker', {
      shouldRunDocker: sinon.stub().returns(true), // Docker mode enabled
      runDocker: runDockerStub
    });

    executeCommandStub = sinon.stub().returns(Promise.resolve());
    mockery.registerMock('./index', executeCommandStub);

    const freshLiveCompare = require('../../../core/command/liveCompare');

    const config = {
      args: { docker: true },
      openReport: false
    };

    await freshLiveCompare.execute(config);

    assert(runDockerStub.calledOnce, 'Should call runDocker');
    assert(runDockerStub.calledWith(config, 'liveCompare'), 'Should call runDocker with liveCompare command');
    assert(!createComparisonBitmapsStub.called, 'Should not call createComparisonBitmaps when in docker mode');
  });

  it('should open report after docker when openReport is enabled', async function () {
    mockery.deregisterAll();
    mockery.disable();
    mockery.enable({ warnOnUnregistered: false, warnOnReplace: false, useCleanCache: true });

    createComparisonBitmapsStub = sinon.stub().returns(Promise.resolve());
    mockery.registerMock('../util/createComparisonBitmaps', createComparisonBitmapsStub);

    runDockerStub = sinon.stub().returns(Promise.resolve());
    mockery.registerMock('../util/runDocker', {
      shouldRunDocker: sinon.stub().returns(true),
      runDocker: runDockerStub
    });

    executeCommandStub = sinon.stub().returns(Promise.resolve());
    mockery.registerMock('./index', executeCommandStub);

    const freshLiveCompare = require('../../../core/command/liveCompare');

    const config = {
      args: { docker: true },
      openReport: true,
      report: ['browser']
    };

    await freshLiveCompare.execute(config);

    // The .finally() handler should call _openReport
    assert(executeCommandStub.calledWith('_openReport', config), 'Should call _openReport when openReport is true');
  });

  it('should propagate errors from createComparisonBitmaps', async function () {
    const testError = new Error('Test error from createComparisonBitmaps');
    createComparisonBitmapsStub.returns(Promise.reject(testError));

    const config = { scenarios: [], viewports: [] };

    try {
      await liveCompare.execute(config);
      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.strictEqual(e.message, 'Test error from createComparisonBitmaps');
    }
  });
});

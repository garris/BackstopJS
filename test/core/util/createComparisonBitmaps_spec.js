const mockery = require('mockery');
const assert = require('assert');
const path = require('path');

describe('createComparisonBitmaps', function () {
  let createComparisonBitmaps;
  let mockRunCompareScenario;
  let mockFs;
  let capturedConfig;

  const mockConfig = {
    backstopConfigFileName: path.join(__dirname, 'backstop.json'),
    tempCompareConfigFileName: '/tmp/test-compare-config.json',
    defaultMisMatchThreshold: 0.1,
    defaultRequireSameDimensions: true,
    compareRetries: 3,
    compareRetryDelay: 5000,
    maxNumDiffPixels: 10,
    args: {}
  };

  const mockConfigJSON = {
    id: 'test-config',
    viewports: [
      { label: 'phone', width: 320, height: 480 },
      { label: 'tablet', width: 1024, height: 768 }
    ],
    scenarios: [
      {
        label: 'Test Scenario 1',
        url: 'http://test.com/page1',
        referenceUrl: 'http://ref.com/page1'
      },
      {
        label: 'Test Scenario 2',
        url: 'http://test.com/page2',
        referenceUrl: 'http://ref.com/page2'
      }
    ],
    paths: {
      bitmaps_reference: 'backstop_data/bitmaps_reference',
      bitmaps_test: 'backstop_data/bitmaps_test'
    },
    engine: 'puppeteer'
  };

  before(function () {
    mockery.enable({ warnOnUnregistered: false, warnOnReplace: false, useCleanCache: true });

    // Mock the config file
    mockery.registerMock(mockConfig.backstopConfigFileName, mockConfigJSON);

    // Mock fs
    mockFs = {
      writeFile: function (filePath, content) {
        return Promise.resolve();
      }
    };
    mockery.registerMock('./fs', mockFs);

    // Mock runCompareScenario
    mockRunCompareScenario = {
      puppet: function (scenarioView) {
        capturedConfig = scenarioView.config;
        return Promise.resolve({
          testPairs: [{
            test: '/path/to/test.png',
            reference: '/path/to/ref.png',
            selector: 'body'
          }]
        });
      },
      playwright: function (scenarioView) {
        capturedConfig = scenarioView.config;
        return Promise.resolve({
          testPairs: [{
            test: '/path/to/test.png',
            reference: '/path/to/ref.png',
            selector: 'body'
          }]
        });
      }
    };
    mockery.registerMock('./runCompareScenario', mockRunCompareScenario);

    // Mock runPlaywright
    mockery.registerMock('./runPlaywright', {
      createPlaywrightBrowser: function () { return Promise.resolve({}); },
      disposePlaywrightBrowser: function () { return Promise.resolve(); }
    });

    // Mock ensureDirectoryPath
    mockery.registerMock('./ensureDirectoryPath', function () {});

    // Mock logger
    mockery.registerMock('./logger', function () {
      return {
        log: function () {},
        error: function () {}
      };
    });

    createComparisonBitmaps = require('../../../core/util/createComparisonBitmaps');
  });

  afterEach(function () {
    capturedConfig = null;
  });

  after(function () {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should pass compare config options to scenarios', async function () {
    await createComparisonBitmaps(mockConfig);

    assert(capturedConfig, 'Should have captured config');
    assert.strictEqual(capturedConfig.compareRetries, 3, 'Should pass compareRetries');
    assert.strictEqual(capturedConfig.compareRetryDelay, 5000, 'Should pass compareRetryDelay');
    assert.strictEqual(capturedConfig.maxNumDiffPixels, 10, 'Should pass maxNumDiffPixels');
  });

  it('should set isCompare flag', async function () {
    await createComparisonBitmaps(mockConfig);

    assert(capturedConfig, 'Should have captured config');
    assert.strictEqual(capturedConfig.isCompare, true, 'Should set isCompare to true');
    assert.strictEqual(capturedConfig.isReference, false, 'Should set isReference to false');
  });

  it('should throw error when scenario missing referenceUrl', async function () {
    const badConfigJSON = {
      id: 'test-config',
      viewports: mockConfigJSON.viewports,
      paths: mockConfigJSON.paths,
      engine: 'puppeteer',
      scenarios: [
        { label: 'Missing referenceUrl', url: 'http://test.com/page' }
      ]
    };

    mockery.deregisterMock(mockConfig.backstopConfigFileName);
    mockery.registerMock(mockConfig.backstopConfigFileName, badConfigJSON);

    // Re-require to get fresh module with new mock
    mockery.resetCache();
    const freshModule = require('../../../core/util/createComparisonBitmaps');

    let errorThrown = false;
    try {
      await freshModule(mockConfig);
    } catch (e) {
      errorThrown = true;
      // Check that error message mentions the issue
      assert(
        e.message.toLowerCase().includes('referenceurl') ||
        e.message.toLowerCase().includes('reference'),
        'Error should mention referenceUrl: ' + e.message
      );
    }

    assert(errorThrown, 'Should have thrown an error');

    // Restore original mock
    mockery.deregisterMock(mockConfig.backstopConfigFileName);
    mockery.registerMock(mockConfig.backstopConfigFileName, mockConfigJSON);
  });

  it('should filter scenarios by filter arg', async function () {
    const configWithFilter = {
      ...mockConfig,
      args: { filter: 'Scenario 1' }
    };

    let scenarioCount = 0;
    mockRunCompareScenario.puppet = function (scenarioView) {
      scenarioCount++;
      capturedConfig = scenarioView.config;
      return Promise.resolve({ testPairs: [] });
    };

    mockery.resetCache();
    const freshModule = require('../../../core/util/createComparisonBitmaps');
    await freshModule(configWithFilter);

    // With filter 'Scenario 1', only 1 scenario should match (Test Scenario 1)
    // multiplied by 2 viewports = 2 calls
    assert.strictEqual(scenarioCount, 2, 'Should only process filtered scenarios');

    // Restore
    mockRunCompareScenario.puppet = function (scenarioView) {
      capturedConfig = scenarioView.config;
      return Promise.resolve({ testPairs: [] });
    };
  });

  it('should ensure viewport labels exist', async function () {
    const configWithUnlabeledViewports = {
      id: 'test-config',
      paths: mockConfigJSON.paths,
      engine: 'puppeteer',
      scenarios: mockConfigJSON.scenarios,
      viewports: [
        { name: 'phone', width: 320, height: 480 }, // name but no label
        { width: 1024, height: 768 } // neither name nor label
      ]
    };

    mockery.deregisterMock(mockConfig.backstopConfigFileName);
    mockery.registerMock(mockConfig.backstopConfigFileName, configWithUnlabeledViewports);

    mockery.resetCache();
    const freshModule = require('../../../core/util/createComparisonBitmaps');
    await freshModule(mockConfig);

    // The module should have set label = name for the first viewport
    assert(capturedConfig.viewports[0].label, 'First viewport should have label');

    // Restore
    mockery.deregisterMock(mockConfig.backstopConfigFileName);
    mockery.registerMock(mockConfig.backstopConfigFileName, mockConfigJSON);
  });
});

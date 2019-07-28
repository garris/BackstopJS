const assert = require('assert');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lifecycleScripts_spec', function () {
  const page = {};
  const viewport = {};
  const browser = {};
  let existsSync = sinon.stub();

  before(function () {
    mockery.registerMock('fs', { existsSync });
    mockery.enable({ warnOnUnregistered: false });
  });

  after(function () {
    mockery.disable();
  });

  describe('onBeforeScript', function () {
    it('should return null when no onBeforeScript is provided', async function () {
      const scenario = {};
      const config = {};
      const { onBeforeScript } = require('../../../core/util/lifecycleScripts');
      const res = await onBeforeScript(
        page,
        scenario,
        viewport,
        false,
        browser,
        config
      );
      assert.strictEqual(res, null);
    });

    it('should execute onBeforeScript when inline function in scenario is provided', async function () {
      const scenario = { onBeforeScript: sinon.stub() };
      const config = {};
      const { onBeforeScript } = require('../../../core/util/lifecycleScripts');
      await onBeforeScript(page, scenario, viewport, false, browser, config);

      assert.strictEqual(scenario.onBeforeScript.callCount, 1);
      assert.strictEqual(
        scenario.onBeforeScript.calledWith(
          page,
          scenario,
          viewport,
          false,
          browser,
          config
        ),
        true
      );
    });

    it('should execute onBeforeScript when inline function in config is provided', async function () {
      const scenario = {};
      const config = { onBeforeScript: sinon.stub() };
      const { onBeforeScript } = require('../../../core/util/lifecycleScripts');
      await onBeforeScript(page, scenario, viewport, false, browser, config);

      assert.strictEqual(config.onBeforeScript.callCount, 1);
      assert.strictEqual(
        config.onBeforeScript.calledWith(
          page,
          scenario,
          viewport,
          false,
          browser,
          config
        ),
        true
      );
    });

    it('should execute onBeforeScript when filename is provided', async function () {
      existsSync.returns(true);
      const scriptPath = './script';
      const scriptStub = sinon.stub();
      mockery.registerMock(`${process.cwd()}/script`, scriptStub);

      const { onBeforeScript } = require('../../../core/util/lifecycleScripts');

      const scenario = { onBeforeScript: scriptPath };
      const config = { env: { engine_scripts: process.cwd() } };
      await onBeforeScript(page, scenario, viewport, false, browser, config);

      assert.strictEqual(scriptStub.callCount, 1);
      assert.strictEqual(
        scriptStub.calledWith(page, scenario, viewport, false, browser, config),
        true
      );
    });

    it("should not execute onBeforeScript when filename doesn't exists", async function () {
      existsSync.returns(false);
      const scriptPath = './script';
      const scriptStub = sinon.stub();
      mockery.registerMock(scriptPath, scriptStub);

      const { onBeforeScript } = require('../../../core/util/lifecycleScripts');
      const scenario = { onBeforeScript: scriptPath };
      const config = { env: { engine_scripts: '.' } };
      await onBeforeScript(page, scenario, viewport, false, browser, config);

      assert.strictEqual(scriptStub.callCount, 0);
    });
  });

  describe('onReadyScript', function () {
    it('should return null when no onReadyScript is provided', async function () {
      const scenario = {};
      const config = {};
      const { onReadyScript } = require('../../../core/util/lifecycleScripts');
      const res = await onReadyScript(
        page,
        scenario,
        viewport,
        false,
        browser,
        config
      );
      assert.strictEqual(res, null);
    });

    it('should execute onReadyScript when inline function is provided', async function () {
      const scenario = { onReadyScript: sinon.stub() };
      const config = {};
      const { onReadyScript } = require('../../../core/util/lifecycleScripts');
      await onReadyScript(page, scenario, viewport, false, browser, config);

      assert.strictEqual(scenario.onReadyScript.callCount, 1);
      assert.strictEqual(
        scenario.onReadyScript.calledWith(
          page,
          scenario,
          viewport,
          false,
          browser,
          config
        ),
        true
      );
    });

    it('should execute onReadyScript when inline function in config is provided', async function () {
      const scenario = {};
      const config = { onReadyScript: sinon.stub() };
      const { onReadyScript } = require('../../../core/util/lifecycleScripts');
      await onReadyScript(page, scenario, viewport, false, browser, config);

      assert.strictEqual(config.onReadyScript.callCount, 1);
      assert.strictEqual(
        config.onReadyScript.calledWith(
          page,
          scenario,
          viewport,
          false,
          browser,
          config
        ),
        true
      );
    });

    it('should execute onReadyScript when filename is provided', async function () {
      existsSync.returns(true);
      const scriptPath = './script';
      const scriptStub = sinon.stub();
      mockery.registerMock(`${process.cwd()}/script`, scriptStub);

      const { onReadyScript } = require('../../../core/util/lifecycleScripts');
      const scenario = { onReadyScript: scriptPath };
      const config = { env: { engine_scripts: '.' } };
      await onReadyScript(page, scenario, viewport, false, browser, config);

      assert.strictEqual(scriptStub.callCount, 1);
      assert.strictEqual(
        scriptStub.calledWith(page, scenario, viewport, false, browser, config),
        true
      );
    });

    it("should not execute onReadyScript when filename doesn't exists", async function () {
      existsSync.returns(false);
      const scriptPath = './script';
      const scriptStub = sinon.stub();
      mockery.registerMock(scriptPath, scriptStub);

      const { onReadyScript } = require('../../../core/util/lifecycleScripts');
      const scenario = { onReadyScript: scriptPath };
      const config = { env: { engine_scripts: '.' } };
      await onReadyScript(page, scenario, viewport, false, browser, config);

      assert.strictEqual(scriptStub.callCount, 0);
    });
  });
});

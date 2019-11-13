const mockery = require('mockery');
const assert = require('assert');

describe('runDocker', function () {
  beforeEach(function () {
    mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
  });

  afterEach(function () {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should run correct docker command', function (done) {
    process.cwd = () => '/path/mock';
    process.argv = ['test'];
    mockery.registerMock('../../package', { version: 'version.mock' });
    mockery.registerMock('child_process', {
      spawn: function (dockerCommand) {
        assert.strictEqual(
          dockerCommand,
          'docker run --rm -it --mount type=bind,source="/path/mock",target=/src backstopjs/backstopjs:version.mock test' +
          ' "--moby=true" "--config=my_config.json" "--filter=my_filter"');
        done();
        return { on: () => {} };
      }
    });

    const config = {
      args: {
        docker: true,
        config: 'my_config.json',
        filter: 'my_filter'
      }
    };

    const { runDocker } = require('../../../core/util/runDocker');
    runDocker(config, 'test');
  });

  it('should not pass undefined args to docker', function (done) {
    process.argv = ['test'];
    mockery.registerMock('child_process', {
      spawn: function (dockerCommand) {
        assert(!dockerCommand.includes('--filter'));
        done();
        return { on: () => {} };
      }
    });

    const config = {
      args: {
        docker: true,
        filter: undefined
      }
    };

    const { runDocker } = require('../../../core/util/runDocker');
    runDocker(config, 'test');
  });

  it('should create tmp config file if config arg is an object', function (done) {
    process.argv = ['test'];
    mockery.registerMock('./fs', {
      writeFile: function () {
        return Promise.resolve();
      }
    });
    mockery.registerMock('child_process', {
      spawn: function (dockerCommand) {
        assert(dockerCommand.includes('--config=backstop.config-for-docker.json'));
        done();
        return { on: () => {} };
      }
    });

    const config = {
      args: {
        docker: true,
        config: {
          id: 'i_am_a_config_object'
        }
      }
    };

    const { runDocker } = require('../../../core/util/runDocker');
    runDocker(config, 'test');
  });
});

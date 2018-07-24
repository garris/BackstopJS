var createBitmaps = require('../util/createBitmaps');
var fs = require('../util/fs');
var logger = require('../util/logger')('clean');

module.exports = {
  execute: function (config) {
    if (config.args.docker) {
        const passAlongArgs = process.argv
                    .slice(3)
                    .join(' ')
                    .replace(/--docker/, '--moby');

        const DOCKER_TEST = `docker run --rm -it --mount type=bind,source="$(pwd)",target=/src backstopjs/backstopjs reference ${passAlongArgs}`;
        const { spawn } = require('child_process');
        console.log('Delegating command to Docker...', DOCKER_TEST)

    return new Promise((resolve, reject) => {   
      const dockerProcess = spawn(DOCKER_TEST, {stdio: 'inherit', shell: true});
      dockerProcess.on('exit', function (code, signal) {
        if (code === 0) {
          resolve();
        } else {
          reject('');
        }
      });
    });

    } else {
      var firstStep;
      // do not remove reference directory if we are in incremental mode
      if (config.args.filter || config.args.i) {
        firstStep = Promise.resolve();
      } else {
        firstStep = fs.remove(config.bitmaps_reference).then(function () {
          logger.success(config.bitmaps_reference + ' was cleaned.');
        });
      }

      return firstStep.then(function () {
        return createBitmaps(config, true);
      }).then(function () {
        console.log('\nRun `$ backstop test` to generate diff report.\n');
      });
    }
  }
};

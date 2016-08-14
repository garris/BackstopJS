var fs = require('../util/fs');
var path = require('path');
var spawn = require('child_process').spawn;
var checksum = require('checksum');
var getCasperArgs = require('../util/getCasperArgs');
var isWin = require('../util/isWin');

function getLastConfigHash (config) {
  return fs.exists(config.compareConfigFileName)
    .then(function (exists) {
      if (exists) {
        return fs.readFile(config.compareConfigFileName, {encoding: 'utf8'})
          .then(function (config) {
            return config[0];
          })
          .then(function (config) {
            return config ? JSON.parse(config).lastConfigHash : false;
          });
      } else {
        return false;
      }
    });
}

// This task will generate a date-named directory with DOM screenshot files as specified in `./capture/config.json` followed by running a report.
// NOTE: If there is no bitmaps_reference directory or if the bitmaps_reference directory is empty then a new batch of reference files will be generated in the bitmaps_reference directory.  Reporting will be skipped in this case.
module.exports = {
  before: ['init'],
  execute: function (config) {
    ensureTestIsGenerated(config)
      .then(function (testMode) {
        // AT THIS POINT WE ARE EITHER RUNNING IN "TEST" OR "REFERENCE" MODE
        var tests = [path.join(config.backstop, 'capture/genBitmaps.js')];
        var casperArgs = getCasperArgs(config, tests);

        console.log('\nRunning CasperJS with: ', casperArgs);

        process.env.PHANTOMJS_EXECUTABLE = path.join(config.backstop, 'node_modules/.bin/phantomjs');

        var casperProcess = path.join(config.backstop, 'node_modules/.bin/casperjs') + (isWin ?  '.cmd' : '');
        var casperChild = spawn(casperProcess , casperArgs, {cwd: config.customBackstop});

        var prefix = 'CasperJS: ';
        casperChild.stdout.on('data', function (data) {
          console.log(prefix, data.toString().slice(0, -1).split('\n').join('\n' + prefix)); // Remove \n
        });

        casperChild.stderr.on('data', function (data) {
          console.error(prefix, data.toString().slice(0, -1).split('\n').join('\n' + prefix)); // Remove \n
        });

        return new Promise(function (resolve, reject) {
          casperChild.on('close', function (code) {
            var success = code === 0; // Will be 1 in the event of failure
            var result = (success)
              ? 'Bitmap file generation completed.'
              : 'Testing script failed with code: ' + code;

            console.log('\n' + result);

            // exit if there was some kind of failure in the casperChild process
            if (code !== 0) {
              console.log('\nLooks like an error occured. You may want to try running `$ npm run echo`. This will echo the requested test URL output to the console. You can check this output to verify that the file requested is indeed being received in the expected format.');
              reject(new Error('An error occured. You may want to try running `$ npm run echo`.'));
              return;
            }

            if (testMode) {
              var executeCommand = require('./index');
              executeCommand('_report', config, true).then(function () {
                resolve();
              });
            } else {
              console.log('\nRun `$ npm run test` to generate diff report.\n');
              resolve();
            }
          });
        });
      });
  }
};

// THIS IS THE BLOCK WHICH SWITCHES US INTO "GENERATE REFERENCE" MODE.  I'D RATHER SOMETHING MORE EXPLICIT THO. LIKE AN ENV PARAMETER...
function ensureTestIsGenerated (config) {
  var executeCommand = require('./index');

  return fs.exists(config.bitmaps_reference)
    .then(function (testMode) {
      if (testMode) {
        return true;
      }

      console.log('\nGenerating reference files.\n');

      // IF WE ARE IN TEST GENERATION MODE -- LOOK FOR CHANGES IN THE CONFIG.
      // TEST WHETHER THERE IS A CONFIG-CONFIG HASH IN THE COMPARE-CONFIG-FILE - IF IT DOESN'T CREATE A NEW ONE (It is likely a scenario where the user is testing shared reference files in a new context. e.g different dev env).
      return getLastConfigHash(config)
        .then(function (compareConfigLastConfigHash) {
          if (compareConfigLastConfigHash === false) {
            return executeCommand('_bless', config, true);
          } else {
            return fs.exists(config.activeCaptureConfigPath)
              .then(function (exists) {
                if (!exists) {
                  throw new Error('NOPE');
                }
              })
              .then(function () {
                return fs.readFile(config.activeCaptureConfigPath, {encoding: 'utf8'})
                  .then(function (config) {
                    return config[0];
                  });
              })
              .then(function (config) {
                if (config && checksum(config) !== compareConfigLastConfigHash) {
                  console.log('\nIt looks like the reference configuration has been changed since last reference batch.');
                  console.log('Please run `$ npm run reference` to generate a fresh set of reference files');
                  console.log('or run `$ npm run bless` then `$ npm run test` to enable testing with this configuration.\n\n');
                  throw new Error('Please run `npm run reference` to generate a fresh set of reference files');
                }

                return false;
              });
          }
        });
    });
}

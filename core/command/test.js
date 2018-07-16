var createBitmaps = require('../util/createBitmaps');

// This task will generate a date-named directory with DOM screenshot files as specified in `./capture/config.json` followed by running a report.
// NOTE: If there is no bitmaps_reference directory or if the bitmaps_reference directory is empty then a new batch of reference files will be generated in the bitmaps_reference directory.  Reporting will be skipped in this case.
module.exports = {
  execute: function (config) {
	const executeCommand = require('./index');
  	if (config.args.docker) {
		const passAlongArgs = process.argv
								.slice(3)
								.filter(argument => !/docker/i.test(argument))
								.join(' ');
  		const DOCKER_TEST = `docker run --rm -it --mount type=bind,source="$(pwd)",target=/src backstopjs/backstopjs test ${passAlongArgs}`;
  		console.log('Delegating command to Docker...', passAlongArgs)

		const { spawn } = require('child_process');

		return new Promise((resolve, reject) => {		
			const dockerProcess = spawn(DOCKER_TEST, {stdio: 'inherit', shell: true});
			dockerProcess.on('exit', function (code, signal) {
				if (code === 0) {
					resolve();
				} else {
					reject('');
				}
			});
		}).finally(() => executeCommand('_openReport', config));

  	} else {
	    return createBitmaps(config, false).then(function () {
	      return executeCommand('_report', config);
	    });
  	}
  }
};

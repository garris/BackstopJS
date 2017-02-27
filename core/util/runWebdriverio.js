var spawn = require('child_process').spawn;

module.exports = function (config, tests) {
  var seleniumChild = spawn("./node_modules/selenium-standalone/bin/selenium-standalone", ["start"], {cwd: config.projectPath + "/node_modules/ing-kit-visual-regression-tests/"})
  var seleniumPrefix = 'Selenium: ';
  var prefix = 'WebdriverIO: ';

  seleniumChild.stdout.on("data", function(data) {
        console.log(seleniumPrefix, data.toString().slice(0, -1).split('\n').join('\n' + seleniumPrefix)); // Remove \n
        // console.log("data", data)
        if(data.indexOf("Selenium started") !== -1) {
          console.log("starting webdriver...");
          var casperChild = spawn("node", [tests[0].replace("genBitmaps", "genBitmapsWebdriver"), config.captureConfigFileName], {cwd: config.projectPath});

          casperChild.stdout.on('data', function (data) {
            console.log(prefix, data.toString().slice(0, -1).split('\n').join('\n' + prefix)); // Remove \n

            if(data.indexOf("finished all screenshots") !== -1) {
              setTimeout(function() {
                seleniumChild.kill();
              }, 1000);
            }
          });

          casperChild.stderr.on('data', function (data) {
            console.error(prefix, data.toString().slice(0, -1).split('\n').join('\n' + prefix)); // Remove \n
          });          
        }
      });

  seleniumChild.stderr.on('data', function (data) {
            console.error(seleniumPrefix, data.toString().slice(0, -1).split('\n').join('\n' + seleniumPrefix)); // Remove \n
          }); 

  return seleniumChild;

};

var gulp  = require('gulp');
var fs    = require('fs');
var spawn = require('child_process').spawn;
var paths = require('../util/paths');



//This task will generate a date-named directory with DOM screenshot files as specified in `./capture/config.json` followed by running a report.
//NOTE: If there is no bitmaps_reference directory or if the bitmaps_reference directory is empty then a new batch of reference files will be generated in the bitmaps_reference directory.  Reporting will be skipped in this case.
gulp.task('test',['init'], function () {


  // genReferenceMode contains the state which switches test or reference file generation modes
  var genReferenceMode = false;

  // THIS IS THE BLOCK WHICH SWITCHES US INTO "GENERATE REFERENCE" MODE.  I'D RATHER SOMETHING MORE EXPLICIT THO. LIKE AN ENV PARAMETER...
  if(!fs.existsSync(paths.bitmaps_reference)){
    console.log('\nGenerating reference files.\n');
    genReferenceMode = true;
  }

  //IF WE ARE IN TEST GENERATION MODE -- LOOK FOR CHANGES IN THE 'CAPTURE CONFIG'.
  if(!genReferenceMode){

    // TEST FOR CAPTURE CONFIG CACHE -- CREATE IF ONE DOESN'T EXIST (If a .cache file does not exist it is likely a scenario where the user is testing shared reference files in a new context. e.g different dev env.).
    if(fs.existsSync(paths.captureConfigFileNameCache)){

      //COMPARE CAPTURE CONFIG AGAINST THE CACHED VERSION. PROMPT IF DIFFERENT.
      var config = fs.readFileSync(paths.activeCaptureConfigPath, 'utf8');
      var cache = fs.readFileSync(paths.captureConfigFileNameCache, 'utf8');
      if(config !== cache){
        console.log('\nIt looks like the reference configuration has been changed since last reference batch.');
        console.log('Please run `$ gulp reference` to generate a fresh set of reference files')
        console.log('or run `$ gulp bless` then `$ gulp test` to enable testing with this configuration.\n\n')
        return;
      }

    }else{
      gulp.run('bless');
    }
  }


  // AT THIS POINT WE ARE EITHER RUNNING IN "TEST" OR "REFERENCE" MODE

  var tests = ['capture/genBitmaps.js'];

  var args = ['--ssl-protocol=any'];//added for https compatibility for older versions of phantom

  var casperArgs = tests.concat(args);

  // var args = ['test'].concat(tests); //this is required if using casperjs test option

  // var casperChild = spawn('casperjs', tests);//use args here to add test option to casperjs execute stmt
  var casperProcess = (process.platform === "win32" ? "casperjs.cmd" : "casperjs");
  var casperChild = spawn(casperProcess, casperArgs);


  casperChild.stdout.on('data', function (data) {
    console.log('CasperJS:', data.toString().slice(0, -1)); // Remove \n
  });


  casperChild.on('close', function (code) {
    var success = code === 0; // Will be 1 in the event of failure
    var result = (success)?'Bitmap file generation completed.':'Testing script failed with code: '+code;

    console.log('\n'+result);

    //exit if there was some kind of failure in the casperChild process
    if(code!=0){
      console.log('\nLooks like an error occured. You may want to try running `$ gulp echo`. This will echo the requested test URL output to the console. You can check this output to verify that the file requested is indeed being received in the expected format.');
      return false;
    };


    var resultConfig = JSON.parse(fs.readFileSync(paths.compareConfigFileName, 'utf8'));
    if(genReferenceMode || !resultConfig.testPairs||resultConfig.testPairs.length==0){
      console.log('\nRun `$ gulp test` to generate diff report.\n')
    }else{
      gulp.run('report');
    }

  });


});

var gulp  = require('gulp');
var fs    = require('fs');
var spawn = require('child_process').spawn;
var paths = require('../util/paths');


// TODO might want to call this compare/bower and rename genConfig to init
// TODO bower as a dependency instead of external command?
// See https://www.npmjs.com/package/gulp-bower


//MANAGE DEPENDENCIES
gulp.task('init',function(cb){

  //load missing bower components
  if(!fs.existsSync(paths.comparePath+'/bower_components')){
    console.log('\nBackstopJS needs to update bower_components, please hang on...\n');
    var bowerProcess = (process.platform === "win32" ? "bower.cmd" : "bower");
    spawn(bowerProcess,['install'],{cwd:paths.comparePath}).on('error', function(){console.log('\nBower process fail. :(  Please report this bug on github.\n');});
  }
  cb();

});

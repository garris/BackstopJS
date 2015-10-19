var gulp   = require('gulp');
var rename = require('gulp-rename');
var paths  = require('../util/paths');

gulp.task('genScripts', function () {
    if (paths.casper_scripts) {
      return gulp.src([paths.casper_scripts_default + '/*.js'])
        .pipe(gulp.dest(paths.casper_scripts));
    } else {
      console.log("ERROR: Can't generate a scripts directory. No 'casper_scripts' path property was found in backstop.json.")
    }
});

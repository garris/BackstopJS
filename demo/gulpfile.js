//gulp chug (BackstopJS: $ gulp reference)
var gulp = require('gulp');
var chug = require('gulp-chug');
gulp.task( 'reference', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'reference' ]
    }));
})
gulp.task( 'test', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'test' ]
    }));
})
gulp.task( 'bless', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'bless' ]
    }));
})

gulp.task( 'clean', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'clean' ]
    }));
})

gulp.task( 'default', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'default' ]
    }));
})

gulp.task( 'echo', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'echo' ]
    }));
})

gulp.task( 'genConfig', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'genConfig' ]
    }));
})

gulp.task( 'openReport', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'openReport' ]
    }));
})

gulp.task( 'report', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'report' ]
    }));
})

gulp.task( 'start', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'start' ]
    }));
})

gulp.task( 'stop', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'stop' ]
    }));
})

gulp.task( 'init', function () {
    gulp.src( './bower_components/backstopjs/gulpfile.js' )
        .pipe( chug({
        tasks:  [ 'init' ]
    }));
});

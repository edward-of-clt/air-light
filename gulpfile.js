/*

REQUIRED STUFF
==============
*/

var changed     = require('gulp-changed');
var gulp        = require('gulp');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var notify      = require('gulp-notify');
var prefix      = require('gulp-autoprefixer');
var minifycss   = require('gulp-minify-css');
var uglify      = require('gulp-uglify');
var cache       = require('gulp-cache');
var concat      = require('gulp-concat');
var util        = require('gulp-util');
var header      = require('gulp-header');
var pixrem      = require('gulp-pixrem');
var exec        = require('child_process').exec;

/*

FILE PATHS
==========
*/

var sassSrc = 'sass/**/*.{sass,scss}';
var sassFile = 'sass/base/layout.scss';
var cssDest = 'css';
var jsSrc = 'js/src/**/*.js';
var jsDest = 'js';

/*

ERROR HANDLING
==============
*/

var handleError = function(task) {
  return function(err) {

      notify.onError({
        message: task + ' failed, check the logs..'
      })(err);

    util.log(util.colors.bgRed(task + ' error:'), util.colors.red(err));
  };
};

/*

BROWSERSYNC
===========

*/

gulp.task('browsersync', function() {

  var files = [
    '**/*.php',
    jsSrc
  ];

  browserSync.init(files, {
    proxy: "dudetest.dev",
    browser: "Google Chrome",
    notify: true
  });

});

/*

STYLES
======
*/

gulp.task('styles', function() {

  gulp.src(sassFile)

    .pipe(sass({
        compass: false,
        bundleExec: true,
        sourcemap: false,
        style: 'compressed',
        debugInfo: true,
        lineNumbers: true,
        // includePaths: require('node-bourbon').includePaths,
        errLogToConsole: true
      }))

    .on('error', handleError('styles'))
    .pipe(prefix('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) // Adds browser prefixes (eg. -webkit, -moz, etc.)
    .pipe(minifycss({
      keepBreaks:false,
      keepSpecialComments:0
    }))
    .pipe(pixrem())
    .pipe(gulp.dest(cssDest))
    .pipe(browserSync.stream());

});

/*

SCRIPTS
=======
*/

var currentDate   = util.date(new Date(), 'dd-mm-yyyy HH:ss');
var pkg       = require('./package.json');
var banner      = '/*! <%= pkg.name %> <%= currentDate %> - <%= pkg.author %> */\n';

gulp.task('js', function() {

      gulp.src(
        [
          'js/src/skip-link-focus-fix.js',
          'js/src/responsive-nav.js',
          'js/src/scripts.js'
        ])
        .pipe(concat('all.js'))
        .pipe(uglify({preserveComments: false, compress: true, mangle: true}).on('error',function(e){console.log('\x07',e.message);return this.end();}))
        .pipe(header(banner, {pkg: pkg, currentDate: currentDate}))
        .pipe(gulp.dest(jsDest));
});

/*

WATCH
=====

*/

// Run the JS task followed by a reload
gulp.task('js-watch', ['js'], browserSync.reload);
gulp.task('watch', ['browsersync'], function() {

  gulp.watch(sassSrc, ['styles']);
  gulp.watch(jsSrc, ['js-watch']);

});

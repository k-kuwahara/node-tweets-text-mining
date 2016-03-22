var gulp   = require('gulp'),
    tsc    = require('gulp-typescript'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('typescript', function() {
   var tsconfig = require('./tsconfig.json');
   gulp.src(tsconfig.filesGlob)
      .pipe(tsc(tsconfig.compilerOptions))
      .pipe(gulp.dest('./src/built/'))
});
gulp.task('minify', function() {
   gulp.src('./src/*.js')
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./src/min'));
});

gulp.task('default', ['typescript', 'minify']);


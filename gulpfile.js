var gulp   = require('gulp'),
    tsc    = require('gulp-typescript'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('typescript', function() {
   gulp.src('./src/ts/*.ts')
      .pipe(tsc())
      .pipe(gulp.dest('./src'))
});
gulp.task('minify', function() {
   gulp.src('./src/*.js')
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./src/min'));
});

gulp.task('default', ['typescript', 'minify']);


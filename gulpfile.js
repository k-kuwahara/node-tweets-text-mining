var gulp   = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('minify', function() {
   gulp.src('./src/*.js)
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./src/dist'));
});

gulp.task('default', ['minify']);


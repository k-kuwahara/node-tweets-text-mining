var gulp   = require('gulp'),
    tsc    = require('gulp-typescript'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint');

var src = {
   'ts': './src/ts/*.ts',
   'js': './src/built/*.js'
}

gulp.task('typescript', function() {
   var tsconfig = require('./tsconfig.json');
   gulp.src(tsconfig.filesGlob)
      .pipe(tsc(tsconfig.compilerOptions))
      .pipe(gulp.dest('./src/built/'))
});

gulp.task('jshint', function() {
   return gulp.src(src.js)
   .pipe(jshint())
   .pipe(jshint.reporter());
});

gulp.task('watch', function() {
   gulp.watch(src.ts, ['typescript']);
   gulp.watch(src.ts, ['jshint']);
});

gulp.task('minify', function() {
   gulp.src('./src/built/*.js')
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./src/built/'));
});

gulp.task('default', ['typescript', 'minify']);


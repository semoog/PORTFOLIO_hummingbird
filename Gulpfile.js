var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');

var input = './views/scss/*.scss';
var output = './views';

gulp.task('styles', function(){
  return gulp.src(input)
  .pipe(sass().on('error', sass.logError))
  .pipe(concat('styles.css'))
  .pipe(gulp.dest(output));
});

gulp.task('default', function(){
  gulp.watch(input, ['styles']);
});

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pump = require('pump');
const terser = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');


const babel = require('gulp-babel');

gulp.task('compress', function (cb) {
  pump([
        gulp.src('static/js/*.js'),
        uglify(),
        gulp.dest('dist/minify')
    ],
    cb
  );
});

function es(){
  return gulp.src('static/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('dist/minify'))
}

gulp.task('compress-es', es);



gulp.task('minify-css', () => {
  return gulp.src('static/css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist/css'));
});


gulp.task('babel', function() {
  gulp.src('static/js/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'))
});
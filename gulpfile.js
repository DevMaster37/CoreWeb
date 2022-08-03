var useref = require('gulp-useref');
var cleanCss = require('gulp-clean-css');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');

var gulp = require('gulp'); // import the gulp module itself
gulp.task('copy-style-assets', function () {
    var stream =  gulp.src('./styles/fonts/**') // stream source
        .pipe(gulp.dest('./dist/styles/fonts/')); // copy to dist/views
    return stream;
});

gulp.task('copy-image-assets', function () {
    var stream =  gulp.src('./images/**') // stream source
        .pipe(gulp.dest('./dist/images/')); // copy to dist/views
    return stream;
});

gulp.task('css-files', function () {
    var stream = gulp.src('./main.html')
        .pipe(useref()) //take a streem from index.html comment
        .pipe(gulpif('*.css', cleanCss({ compatibility: 'ie9' }))) // if .css file, minify
        .pipe(gulpif('*.css', gulp.dest('./dist'))); // copy to dist
    return stream;
});


gulp.task('bower-files', function () {
    var stream = gulp.src('./main.html')
        // .pipe(wiredep({
        //     directory: 'bower_components' //inject dependencies
        // }))
        .pipe(useref())
        .pipe(gulpif('*.js', ngAnnotate())) // ng-annotate if .js
        .pipe(gulpif('*.js', uglify())) // uglify if .js
        .pipe(gulpif('*.js', gulp.dest('./dist'))); // paste to dist
    return stream;
});

var runSequence = require('gulp4-run-sequence');/* some other plugins go here *//* define our tasks here */
gulp.task('build', function (callback) {
    runSequence(
        'copy-style-assets',
        'copy-image-assets',
        'css-files',
        'bower-files',
        /* other tasks maybe */
    callback);
});

var clean = require('gulp-clean');
gulp.task('clean', function () {
    var stream =  gulp.src('./dist', {read: false})
                  .pipe(clean());
    return stream
});

gulp.task('watch', function() {
    gulp.watch('./**/**/*.*', function () {
        runSequence(
            'css-files',
            'bower-files',
        );
    });
});
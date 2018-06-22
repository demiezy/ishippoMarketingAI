var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var cleanCSS = require('gulp-clean-css');
var app ={};

var config = {
    assetsDir: 'public/assets',
    sassPattern: 'scss/**/*.scss'
}
app.addStyle = function(paths, outputFilename) {
    gulp.src('./public/assets/scss/*.scss')
        .pipe(plugins.plumber(function(error) {
            console.log(error.toString());
            this.emit('end');
        }))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass())
        .pipe(plugins.concat(outputFilename))
        .pipe(cleanCSS())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets/css'));
}


app.copy = function(srcFiles, outputDir) {
    gulp.src(srcFiles)
        .pipe(gulp.dest(outputDir));
}


gulp.task('styles', function() {
    app.addStyle([
        config.assetsDir+'/sass/style.scss'
    ], 'style.css');
});




gulp.task('watch', function() {
    gulp.watch(config.assetsDir+'/'+config.sassPattern, ['styles']);
});

gulp.task('default', ['styles','watch']);
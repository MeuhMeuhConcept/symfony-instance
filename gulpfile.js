var gulp = require('gulp'),
    del = require('del'),
    jshint = require('gulp-jshint'),
    requirejsOptimize = require('gulp-requirejs-optimize'),
    jsmin = require('gulp-jsmin'),
    rename = require('gulp-rename'),
    cssmin = require('gulp-cssmin'),
    concat = require('gulp-concat'),
    fileinclude = require('gulp-file-include'),
    sass = require('gulp-sass'),
    es = require("event-stream")
    ;

var options = require('./gulpfile.json');

/****************
 *    SCRIPT    *
 ****************/
gulp.task('script.install.minify', function() {
    var streams = [];
    for(var index in options.script.install.minify) {
        var files = options.script.install.minify[index];
        var dir = index || "lib";
        streams.push(
          gulp.src(files)
              .pipe(jsmin())
              .pipe(rename({suffix: '.min'}))
              .pipe(gulp.dest(options.paths.dist + 'js/' + dir))
        );
    }

    return es.merge(streams);
});

gulp.task('script.install.direct', function() {
    var streams = [];
    for(var index in options.script.install.direct) {
        var files = options.script.install.direct[index];
        var dir = index || "lib";
        streams.push(
            gulp.src(files)
                .pipe(gulp.dest(options.paths.dist + 'js/' + dir))
        );
    }

    return es.merge(streams);
});

gulp.task('script.install', ['script.install.direct', 'script.install.minify']);

gulp.task('script.build', ['script.install'], function() {
    return gulp.src(options.paths.sources + 'js/**/*.js')
        .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
        .pipe(gulp.dest(options.paths.dist + 'js'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        //.pipe(jshint.reporter('fail'))
        .pipe(gulp.dest(options.paths.dist + 'js'));
});

gulp.task('script.optimize', ['script.build', 'script.install'], function(){
    var streams = [];
    for(var index in options.script.optimize) {
        var opt = options.script.optimize[index];
        var requirejsOptions = require(options.paths.sources + opt.options);
        //reset baseURL
        delete requirejsOptions.baseUrl;
        streams.push(
            gulp.src(options.paths.dist + opt.file)
                .pipe(requirejsOptimize(requirejsOptions))
                .pipe(gulp.dest(options.paths.dist + 'js/optimize'))
        );
    }

    return es.merge(streams);
});

gulp.task('script', ['script.build', 'script.install']);

/***************
 *    STYLE    *
 ***************/
gulp.task('style.install.minify', function() {
    var streams = [];
    for(var index in options.style.install.minify) {
        var files = options.style.install.minify[index];
        var dir = index || "lib";
        streams.push(
            gulp.src(files)
                .pipe(cssmin())
                .pipe(rename({suffix: '.min'}))
                .pipe(gulp.dest(options.paths.dist + 'css/' + dir))
        );
    }
    return es.merge(streams);
});

gulp.task('style.install.direct', function() {
    return gulp.src(options.style.install.direct)
        .pipe(gulp.dest(options.paths.dist + 'css'));
});

gulp.task('style.install.fonts', function() {
    return gulp.src(options.style.install.fonts)
        .pipe(gulp.dest(options.paths.dist + 'fonts'));
});

gulp.task('style.install.images', function() {
    var streams = [];

    streams.push(
        gulp.src(options.paths.sources + 'images/**')
            .pipe(gulp.dest(options.paths.dist + 'images'))
    );

    for(var index in options.style.install.images) {
        var files = options.style.install.images[index];
        var dir = index || "img";
        streams.push(
            gulp.src(files)
                .pipe(gulp.dest(options.paths.dist + dir))
        );
    }
    return es.merge(streams);
});

gulp.task('style.install.documents', function() {
    var streams = [];

    streams.push(
        gulp.src(options.paths.sources + 'documents/**')
            .pipe(gulp.dest(options.paths.dist + 'documents'))
    );

    for(var index in options.style.install.documents) {
        var files = options.style.install.documents[index];
        var dir = index || "documents";
        streams.push(
            gulp.src(files)
                .pipe(gulp.dest(options.paths.dist + dir))
        );
    }
    return es.merge(streams);
});

gulp.task('style.install', ['style.install.direct', 'style.install.minify', 'style.install.fonts', 'style.install.images', 'style.install.documents']);

gulp.task('style.build.css', function() {
    return gulp.src(options.paths.sources + 'css/**/*.css')
        .pipe(gulp.dest(options.paths.dist + 'css'))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(options.paths.dist + 'css'));
});

gulp.task('style.build.sass', function() {
    return gulp.src(options.paths.sources + 'sass/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(options.paths.dist + 'css'));
});

gulp.task('style.build', ['style.build.css', 'style.build.sass']);

gulp.task('style', ['style.install', 'style.build'], function() {
    var streams = [];
    for(var name in options.style.concat) {
        var files = options.style.concat[name];
        files.map(function(file, idx, arr){
            arr[idx] = options.paths.dist + 'css/' + file;
        });

        streams.push(
            gulp.src(files)
                .pipe(concat(name + '.min.css'))
                .pipe(gulp.dest(options.paths.dist + 'css'))
        );
    }
    return es.merge(streams);
});

gulp.task('watch', function() {
    gulp.watch([options.paths.sources + 'js/**/*.js'], ['script.build']);
    gulp.watch([options.paths.sources + 'css/**/*.css', options.paths.sources + 'css/**/*.less'], ['style']);
});

gulp.task('default', ['clean'], function() {
    gulp.start('script');
    gulp.start('style');
});

gulp.task('clean', function() {
    return del([options.paths.dist], {force: true});
});

"use strict";

const gulp = require("gulp");
const concat = require("gulp-concat-css");
const rename = require("gulp-rename");
const minifyCSS = require("gulp-minify-css");
const uglify = require("gulp-uglify");
const htmlmin = require("gulp-htmlmin");
const del = require("del");

const tsc  = require('gulp-typescript-compiler');

const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

const tscConfig = require('./tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');

const tslint = require('gulp-tslint');

const browserify = require("browserify");
const source = require('vinyl-source-stream');
const tsify = require("tsify");

gulp.task('clean', function () {
    return del('build/*');
});

gulp.task('build-css', function () {
    gulp.src(['*/**/*.css','*.css' , '!node_modules/**/*.css'])
        .pipe(concat('bundle.css'))
        .pipe(minifyCSS())
        .pipe(rename('bundle.min.css'))
        .pipe(gulp.dest('build/'));
});

gulp.task('build-html', function () {
    gulp.src(['*/**/*.html','*.html','!node_modules/**/*.html'])
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('build/'));
});

gulp.task('tslint', () => {
    return gulp.src("app/**/*.ts")
        .pipe(tslint({
            formatter: 'prose'
        }))
        .pipe(tslint.report());
});

/*
gulp.task('compile', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("build/"));
});*/

//gulp.task('compile', () => {
//    let tsResult = gulp
//        .src("app/**/*.ts")
//        .pipe(sourcemaps.init())
//        .pipe(tsProject());
//    return tsResult.js
//        .pipe(sourcemaps.write("."))
        //.pipe(concat('bundle.js'))
//        .pipe(gulp.dest("build/"))
        //.pipe(uglify())
        //.pipe(rename('bundle.min.js'))
        //.pipe(gulp.dest("build/"))
//});

gulp.task('compile', ['clean'], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['app/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build/'));
});

gulp.task('default', ['clean','build-html','build-css','compile'], () => {
    console.log("Building the project ...");
});
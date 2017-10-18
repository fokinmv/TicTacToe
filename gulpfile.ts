"use strict";

const gulp = require("gulp");
const concatCSS = require("gulp-concat-css");
const rename = require("gulp-rename");
const minifyCSS = require("gulp-minify-css");
const htmlmin = require("gulp-htmlmin");
const del = require("del");
const typescript = require("gulp-typescript");
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');

gulp.task('clean', function () {
    return del('build/*');
});

gulp.task('build-css', function () {
    gulp.src(['*/**/*.css','*.css' , '!node_modules/**/*.css'])
        .pipe(concatCSS('bundle.css'))
        .pipe(minifyCSS())
        .pipe(rename('bundle.min.css'))
        .pipe(gulp.dest('build/'));
});

gulp.task('build-html', function () {
    gulp.src(['*/**/*.html','*.html','!node_modules/**/*.html'])
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('build/'));
});

gulp.task('compile', function () {
    return gulp.src(['app/**/*.ts','!node_modules/**/*.ts'])
        .pipe(typescript({
            noImplicitAny: true,
            outFile: 'output.js'
        }))
        .pipe(gulp.dest('built/'));
});

gulp.task('default', ['clean','build-html','build-css','compile'], () => {
    console.log("Building the project ...");
});
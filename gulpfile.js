const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const webp = require('gulp-webp');
const newer = require('gulp-newer');
const fileInclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const ttf2woff2 = require('gulp-ttf2woff2');

function browsersync() {
  // Чтобы переставить работу с html на php
  // убрать пункт server полностью и раскомментить
  // proxy, поставить туда название папки из openserver
  browserSync.init({
    server: {
      baseDir: 'src',
    },
    // proxy: 'example.ru',
    notify: false,
  });
}

function cleanPublic() {
  return del('public');
}

function images() {
  return src('src/images/**/*')
    .pipe(
      imagemin([
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: true
            }
          ]
        })
      ])
    )
    .pipe(webp())
    .pipe(newer('src/images'))
    .pipe(dest('src/images'))
    .pipe(browserSync.stream());
}

function scripts() {
  return src(['src/js/*.js'])
    .pipe(browserSync.stream());
}

function styles() {
  return src('src/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }).on('error', scss.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 10 versions'],
        grid: true,
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(dest('src/css'))
    .pipe(browserSync.stream());
}

function fonts() {
  return src('src/fonts/**/*')
    .pipe(ttf2woff2())
    .pipe(dest('src/fonts'))
    .pipe(browserSync.stream());
}

function build() {
  return src(
    [
      'src/css/**/*.css',
      'src/fonts/**/*',
      'src/js/**/*.js',
      'src/**/*.html',
      'src/images/**/*',
      'src/videos/**/*',
    ],
    { base: 'src' }
  ).pipe(dest('public'));
}

function html() {
  return (
    src('src/**/*.html')
    // удалить *.html
    // и сделать *.php
  ).pipe(browserSync.stream())
}


function watching() {
  watch(['src/scss/**/*.scss'], styles);
  watch(['src/images/**/*'], images);
  watch(['src/js/**/*.js'], scripts);
  watch(['src/**/*.{html,php}'], html);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanPublic = cleanPublic;
exports.fonts = fonts;


exports.build = series(cleanPublic, fonts, build);
exports.default = parallel(
  html,
  images,
  styles,
  scripts,
  browsersync,
  fonts,
  watching
);

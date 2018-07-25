//'use strict';

// const path = require('path');
const gulp = require('gulp');
// const eslint = require('gulp-eslint');
const del = require('del');
const runSequence = require('run-sequence');
// const browserSync = require('browser-sync');
const workboxBuild = require('workbox-build');
const webpack = require('gulp-webpack');
//import swPrecache from 'sw-precache';
const gulpLoadPlugins = require('gulp-load-plugins');
// import {output as pagespeed} from 'psi';
// const pkg = require('./package.json');

const $ = gulpLoadPlugins();
// const reload = browserSync.reload;

// Lint JavaScript
// gulp.task('lint', () => {
//   gulp.src(['app/js/**/*.js','!node_modules/**'])
//     .pipe(eslint())
//     .pipe(eslint.format())
//     .pipe(eslint.failAfterError());
//   }
// );

// Optimize images
gulp.task('images-png', () =>
  gulp.src('app/img/**/*.png')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/img'))
    .pipe($.size({title: 'images'}))
);

gulp.task('images-jpg', () => {
  gulp.src('app/img/*.jpg')
    .pipe($.responsive({
      '*.jpg': [{
        width: 200,
        rename: { suffix: '-200px' },
      }, {
        width: 500,
        rename: { suffix: '-500px' },
      }, {
        width: 630,
        rename: { suffix: '-630px' },
      }, {
        width: 800,
        rename: { suffix: '-800px' },
      }, {
        rename: { suffix: '-original' },
      }],
      // Resize all PNG images to be retina ready
      // '*.png': [{
      //   width: 250,
      // }, {
      //   width: 250 * 2,
      //   rename: { suffix: '@2x' },
      // }],
    }, {
      quality: 70,
      progressive: true,
      withMetadata: false,
      errorOnUnusedImage: false,
      passThroughUnused: true,

    }))
    .pipe(gulp.dest('dist/img'))
    .pipe($.size({title: 'images'}));
});

// Copy all files at the root level (app)
gulp.task('copy', () =>
  gulp.src([
    'app/*',
    'app/data/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    // 'app/css/**/*.scss',
    'app/css/**/*.css'
  ])
    .pipe($.newer('.tmp/css'))
    .pipe($.sourcemaps.init())
    // .pipe($.sass({
    //   precision: 10
    // }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/css'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulp.dest('.tmp/css'));
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
// gulp.task('scripts', () =>
//     gulp.src([
//       // Note: Since we are not using useref in the scripts build pipeline,
//       //       you need to explicitly list your scripts here in the right order
//       //       to be correctly concatenated
//       // './node_modules/intersection-observer/intersection-observer.js',
//       './app/js/lazyload.es2015.js',
//       './app/js/dbhelper.js',
//       './app/js/restaurant_info.js',
//       './app/js/main.js'
//     ])
//       .pipe($.newer('.tmp/js'))
//       .pipe($.sourcemaps.init())
//       .pipe($.babel())
//       .pipe($.sourcemaps.write())
//       .pipe(gulp.dest('.tmp/js'))
//       .pipe($.concat('main.min.js'))
//       .pipe($.uglify({preserveComments: 'some'}))
//       // Output files
//       .pipe($.size({title: 'scripts'}))
//       .pipe($.sourcemaps.write('.'))
//       .pipe(gulp.dest('dist/js'))
//       .pipe(gulp.dest('.tmp/js'))
// );

gulp.task('scripts-webpack', () => {
    gulp.src('')
      .pipe(webpack({
        entry: {
          main: "./app/js/main.js",
          restaurant: "./app/js/restaurant.js"
        },
        output: {
          filename: '[name].js',
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["env"]
                }
              }
            },
          ]
        }
      }))
      .pipe(gulp.dest('dist/js'));
  }
);

// gulp.task('scripts-restaurant', () =>
//     gulp.src('./app/js/restaurant.js')
//       .pipe($.newer('.tmp'))
//       .pipe($.sourcemaps.init())
//       .pipe($.babel())
//       .pipe($.sourcemaps.write())
//       .pipe(gulp.dest('.tmp'))
//       .pipe($.concat('restaurant.js'))
//       // .pipe($.uglify({preserveComments: 'some'}))
//       // Output files
//       .pipe($.size({title: 'scripts'}))
//       .pipe($.sourcemaps.write('.'))
//       // .pipe(gulp.dest('dist/js'))
//       .pipe(gulp.dest('./app/js/restaurant.babel.js'))
// );

// gulp.task('scripts-main', () =>
//     gulp.src('./app/js/main.js')
//       .pipe($.newer('.tmp'))
//       .pipe($.sourcemaps.init())
//       .pipe($.babel())
//       .pipe($.sourcemaps.write())
//       .pipe(gulp.dest('.tmp'))
//       .pipe($.concat('main.js'))
//       // .pipe($.uglify({preserveComments: 'some'}))
//       // Output files
//       .pipe($.size({title: 'scripts'}))
//       .pipe($.sourcemaps.write('.'))
//       // .pipe(gulp.dest('dist/js'))
//       .pipe(gulp.dest('./app/js/main.babel.js'))
// );


// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe($.useref({
      searchPath: '{.tmp, app}',
      noAssets: true
    }))

    // Minify any HTML
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))
    // Output files
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest('dist'));
});

// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Watch files for changes & reload
// gulp.task('serve', ['scripts', 'styles'], () => {
//   browserSync({
//     notify: false,
//     // Customize the Browsersync console logging prefix
//     logPrefix: 'WSK',
//     // Allow scroll syncing across breakpoints
//     scrollElementMapping: ['main', '.mdl-layout'],
//     // Run as an https by uncommenting 'https: true'
//     // Note: this uses an unsigned certificate which on first access
//     //       will present a certificate warning in the browser.
//     // https: true,
//     server: ['.tmp', 'app'],
//     port: 3000
//   });

//   gulp.watch(['app/**/*.html'], reload);
//   gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
//   gulp.watch(['app/scripts/**/*.js'], ['lint', 'scripts', reload]);
//   gulp.watch(['app/images/**/*'], reload);
// });

// Build and serve the output from the dist build
// gulp.task('serve:dist', ['default'], () =>
//   browserSync({
//     notify: false,
//     logPrefix: 'WSK',
//     // Allow scroll syncing across breakpoints
//     scrollElementMapping: ['main', '.mdl-layout'],
//     // Run as an https by uncommenting 'https: true'
//     // Note: this uses an unsigned certificate which on first access
//     //       will present a certificate warning in the browser.
//     // https: true,
//     server: 'dist',
//     port: 3001
//   })
// );

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles',
    // 'scripts-restaurant', 
    // 'scripts-main',
    'scripts-webpack',
    'html',  
    // 'images-jpg', 
    // 'images-png', 
    'copy',
    'service-worker',
    cb
  )
);

// Run PageSpeed Insights
// gulp.task('pagespeed', cb =>
//   // Update the below URL to the public URL of your site
//   pagespeed('example.com', {
//     strategy: 'mobile'
//     // By default we use the PageSpeed Insights free (no API key) tier.
//     // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
//     // key: 'YOUR_API_KEY'
//   }, cb)
// );

// // Copy over the scripts that are used in importScripts as part of the service-worker task.
// gulp.task('copy-sw-scripts', () => {
//   return gulp.src(['node_modules/sw-toolbox/sw-toolbox.js', 'app/js/sw/runtime-caching.js'])
//     .pipe(gulp.dest('dist/js/sw'));
// });

// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why you should care.
// Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the 'dist' directory, to allow
// live reload to work as expected when serving from the 'app' directory.
gulp.task('service-worker', () => {
  // const rootDir = 'dist';
  // const filepath = path.join(rootDir, 'sw.js');
  return workboxBuild.injectManifest({
    swSrc: 'sw.src.js',
    swDest: 'dist/sw.js',
    globDirectory: 'dist',
    globPatterns: [
      '**/*.{js,css,html,png}',
    ]
  }).then((precached) => {
    precached.warnings.forEach(console.warn);
    console.log(`${precached.count} files will be precached, totaling ${precached.size} bytes.`);
  }).catch((err) => {
      console.error(`Unable to generate a new service worker.`, err);
  });

  // return swPrecache.write(filepath, {
  //   // Used to avoid cache conflicts when serving on localhost.
  //   cacheId: pkg.name || 'web-starter-kit',
  //   // sw-toolbox.js needs to be listed first. It sets up methods used in runtime-caching.js.
  //   importScripts: [
  //     'js/sw/sw-toolbox.js',
  //     'js/sw/runtime-caching.js'
  //   ],
  //   staticFileGlobs: [
  //     // Add/remove glob patterns to match your directory setup.
  //     `${rootDir}/img/**/*`,
  //     `${rootDir}/js/**/*.js`,
  //     `${rootDir}/css/**/*.css`,
  //     `${rootDir}/*.{html,json}`
  //   ],
  //   // Translates a static file path to the relative URL that it's served from.
  //   // This is '/' rather than path.sep because the paths returned from
  //   // glob always use '/'.
  //   stripPrefix: rootDir + '/'
  // });
});

// Load custom tasks from the `tasks` directory
// Run: `npm install --save-dev require-dir` from the command-line
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }

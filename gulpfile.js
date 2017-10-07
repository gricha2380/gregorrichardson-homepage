var gulp = require('gulp'),
	sass = require("gulp-sass"),
	uglify = require("gulp-uglify"), // CSS + JS
	concat = require("gulp-concat"),
	gutil = require('gulp-util'),
	cssnano = require('gulp-cssnano'), // if I'm working with regular CSS
	htmlmin = require('gulp-htmlmin');
	map = require('gulp-sourcemaps');
	del = require('del'),
	browserSync = require('browser-sync').create();
	var gutil = require( 'gulp-util' );
	var ftp = require( 'vinyl-ftp' );

// FTP Info
var user = process.env.FTP_USER;
var password = process.env.FTP_PWD;
var host = '173.201.63.1';
var port = 21;
var localFilesGlob = ['css/*','js/*','img/*','*.html'];//['./**/*'];
var remoteFolder = '/gregor'

// helper function to build an FTP connection based on our configuration
function getFtpConnection() {
    return ftp.create({
        host: host,
        port: port,
        user: user,
        password: password,
        parallel: 5,
        log: gutil.log
    });
}

/**
 * Deploy task.
 * Copies the new files to the server
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy`
 */
gulp.task('ftp-deploy', function() {
    var conn = getFtpConnection();
    gutil.log(conn);

    return gulp.src(localFilesGlob, { base: '.', buffer: false })
        .pipe( conn.newer( remoteFolder ) ) // only upload newer files
        .pipe( conn.dest( remoteFolder ) )
    ;
});

/**
 * Watch deploy task.
 * Watches the local copy for changes and copies the new files to the server whenever an update is detected
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy-watch`
 */
gulp.task('ftp-deploy-watch', function() {

    var conn = getFtpConnection();

    gulp.watch(localFilesGlob)
    .on('change', function(event) {
      console.log('Changes detected! Uploading file "' + event.path + '", ' + event.type);

      return gulp.src( [event.path], { base: '.', buffer: false } )
        .pipe( conn.newer( remoteFolder ) ) // only upload newer files
        .pipe( conn.dest( remoteFolder ) )
      ;
    });
});
// END FTP

// Static Server + watching scss/html files
gulp.task('serve', ['css'], function() {

    browserSync.init({
        server: "",
        port: 2380
    });
    gulp.watch("*.html",["html"]).on('change', browserSync.reload);
	gulp.watch("assets/css/*",["css"]).on('change', browserSync.reload);
	gulp.watch("assets/scss/*",["sass"]).on('change', browserSync.reload);
	gulp.watch("assets/js/*",["js"]).on('change', browserSync.reload);
});

// concat & minify css
gulp.task("css",function(){
	gulp.src(['assets/css/semantic.min.css','assets/css/style.css'])
	.pipe(map.init())
	.pipe(concat('style.min.css'))
	.pipe(cssnano({discardComments: {removeAll: true}}))
	.pipe(map.write("output/assets"))
	.pipe(gulp.dest('output/assets/css'))
	.pipe(browserSync.stream())
});

// build sass
gulp.task('sass', function() {
  return gulp.src("css/*.scss")
      .pipe(map.init())
      .pipe(sass())
      .pipe(cssnano({discardComments: {removeAll: true}}))
      .pipe(map.write("/"))
      .pipe(gulp.dest('css'))
      .pipe(browserSync.stream());
});

// concat & minify js
gulp.task("js",function(){
	//gulp.src(["assets/js/jquery.min.js","assets/js/semantic.min.js","assets/js/canvasjs.min.js","assets/js/scripts.js"])
	gulp.src("assets/js/*.js")
	.pipe(map.init())
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(map.write("/"))
	.pipe(gulp.dest('output/assets/js'))
	.pipe(browserSync.stream())
});


gulp.task('clean', function() {
	del(['output']); // 'output/css/*.css*', 'output/js/app*.js*'
});

gulp.task('cleanCSS', function() {
	del(['output/css']); // 'output/css/*.css*', 'output/js/app*.js*'
});


// copy misc. files to output
gulp.task("copy",function(){
	gulp.src(["assets/css/**/*","assets/data/*","assets/images/*","assets/js/dummyData.js"],{base:"."})
	.pipe(gulp.dest("output"));
});

//minify html
gulp.task("html", function(){
	gulp.src(["*.html"])
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest("output"))
	//.pipe(browserSync.stream())
});

gulp.task("log",function(){
	gutil.log("Job's done.")
});

// rolling my own default task
gulp.task("build", ["clean","css","js","copy","html","log"]);

gulp.task("default", ["css","js","copy","html","log","serve"]);

// look for changes. DELETE this if serve task works!
gulp.task("watch", function(){
	gulp.watch("*.html").on('change', browserSync.reload)
	gulp.watch("assets/css/*",["css"])
	gulp.watch("assets/js/*",["js"])
	gulp.watch('assets/scss/**/*.scss', ['sass'])
});



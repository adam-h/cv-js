var fs = require('fs');
var gulp = require('gulp');
var handlebars = require('./do-handlebars.js');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');

var TEMPLATE_DIR = './templates/';

var optimist = require('optimist')
	.usage('Use to build static CV HTML files based on JSON data and templates. Also includes a test server (-s).')
	.options('o', {
		alias : 'output_dir',
		describe: 'Directory to output the built files to',
		default : 'dist',
	})
	.options('t', {
		alias : 'template',
		describe: 'Template to use (in templates/ dir)',
		default : 'basic',
	})
	.options('d', {
		alias : 'data_dir',
		describe: 'Directory containing person.json and optional markdown files',
		default : 'user_data',
	})
	.options('p', {
		alias : 'port',
		describe: 'Port for test server when watching',
		default: 8080
	})
	.alias('h','help');

var args = optimist.argv,
	sass_file = TEMPLATE_DIR + args.template + '/' + args.template + '.scss',
	hbs_file = TEMPLATE_DIR + args.template + '/' + args.template + '.hbs';

gulp.task('sass', function () {
    gulp.src(sass_file)
        .pipe(sass())
        .pipe(gulp.dest(args.output_dir));
});

gulp.task('template', function(){
	var user_data = JSON.parse(fs.readFileSync(args.data_dir + '/person.json', 'utf8'));

	gulp.src(hbs_file)
		.pipe(handlebars(user_data, args.data_dir+'/'))
		.pipe(rename("index.html"))
		.pipe(gulp.dest(args.output_dir));
});

gulp.task('staticsvr', function(next) {
	var staticS = require('node-static'),
		server = new staticS.Server(args.output_dir);

	require('http').createServer(function (request, response) {
		request.addListener('end', function () {
			server.serve(request, response);
		}).resume();
	}).listen(args.port, function() {
		gutil.log('Server listening on port: ' + gutil.colors.magenta(args.port));
		next();
	});
});

gulp.task('watch', ['staticsvr', 'sass', 'template'], function() {
	var server = livereload();
	gulp.watch(sass_file, ['sass']);
	gulp.watch(hbs_file, ['template']);
	gulp.watch(args.data_dir + '/**', ['template']);
	gulp.watch(args.output_dir + '/**').on('change', function(file) {
		server.changed(file.path);
	});
});

gulp.task('default', ['sass', 'template']);

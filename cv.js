var fs = require('fs'),
	util = require('util');

var Handlebars = require('handlebars');
var Markdown = require('markdown').markdown;

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
	.options('s', {
		alias : 'serve',
		describe: 'Run a test server on port 8080',
		boolean: true
	})
	.alias('h','help');

var args = optimist.argv;

if(args.help) {
	optimist.showHelp();
	process.exit(0);
}

var user_data_dir = args.data_dir + '/';
var template_dir = './templates/' + args.template + '/';
var output_dir = args.output_dir + '/';

Handlebars.registerHelper('markdown', function(text) {
	var out;
	if(typeof text == 'string') {
		out = Markdown.toHTML(text);
	} else if(typeof text == 'object' && text.file && /^\w+\.md$/.test(text.file)) {
		out = Markdown.toHTML( fs.readFileSync(user_data_dir + text.file, 'utf8') );
	} else {
		out = '<!-- Invalid item -->';
	}
	return new Handlebars.SafeString(out);
});

function copyTo(file, from, to, cb) {
	var is = fs.createReadStream(from + file);
	var os = fs.createWriteStream(to + file);
	util.pump(is, os, cb);
}

function getHTML(template_path, user_data) {
	var raw_template = fs.readFileSync(template_path, 'utf8');
	var template = Handlebars.compile(raw_template);
	var header = '<!doctype html><meta charset="utf-8">';
	return header + template(user_data);
}

if(args.serve) {
	var static_server = require('node-static');
	var fileServer = new static_server.Server(template_dir, { cache: false, headers: {"Cache-Control": "no-cache, must-revaliate"} });

	require('http').createServer(function (request, response) {
		var filePath = '.' + request.url;
   		if (request.url == '/') {
   			var user_data = JSON.parse(fs.readFileSync(user_data_dir + 'person.json', 'utf8'));
   			var page = getHTML(template_dir + args.template + '.handlebars', user_data);
   			response.writeHead(200, {'Content-Type': 'text/html'});
			response.end(page);
   		} else {
			request.addListener('end', function () {
				fileServer.serve(request, response);
			});
		}
	}).listen(8080);

	console.log('Test server setup on port 8080 ...');
	console.log('Navigate to http://localhost:8080/ to view your CV');
} else {
	var user_data = JSON.parse(fs.readFileSync(user_data_dir + 'person.json', 'utf8'));
	var page = getHTML(template_dir + args.template + '.handlebars', user_data);

	if(!fs.existsSync(output_dir)) {
		fs.mkdirSync(output_dir);
	}

	fs.writeFile(output_dir + 'index.html', page, 'utf8', function(err) {
		console.log(err ? err :'HTML generated');
	});

	var assets = fs.readdirSync(template_dir);
	assets.forEach(function(file) {
		if(file.indexOf('handlebars') === -1) {
			copyTo(file, template_dir, output_dir);
			console.log('Copied ' + file);
		}
	});
}

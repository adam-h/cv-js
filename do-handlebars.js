var map = require("map-stream");
var fs = require("fs");
var Handlebars = require('handlebars');
var Markdown = require('markdown').markdown;
var gutil = require('gulp-util');
var ext = gutil.replaceExtension;

module.exports = function(data_file, user_data_dir) {
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

	function doTemplate(file, callback) {
		var template = Handlebars.compile(file.contents.toString());

		file.path = ext(file.path, '.html');
		file.contents = new Buffer(template(data_file));
		callback(null, file);
	}

	return map(doTemplate);
};

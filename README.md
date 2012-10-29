cv-js
=====

System to build static HTML CVs using JSON user data in HTML templates with a sprinkling of 
Markdown.

Requirements and Installation
=============================

 * [Node.js](http://nodejs.org/) 0.8+ (may work on earlier versions)
 * [NPM](https://npmjs.org/)

A few node packages are required, they can be installed by running the following:

    npm install optimist handlebars markdown node-static

Building CV
=======================

The static HTML output can be generated using:

    node cv.js

This will build the `index.html` file and copy over any template assets to the output directory`.

Options:

 * `-o`, `--output_dir`  Directory to output the built files to _[default: "dist"]_
 * `-t`, `--template`    Template to use (in templates/ dir) _[default: "basic"]_
 * `-d`, `--data_dir`    Directory containing person.json and optional markdown files _[default: "user_data"]_
 * `-s`, `--serve`       Run a test server on port 8080 _[boolean]_

Testing
-------

A simple HTTP server to test with is included, which can be run using:

    node cv.js --serve

Which will start a server on port 8080 serving from the default paths. The paths can be changed 
using the above options.

Configuring
===========

Edit the main `person.json` file in the `user_data` directory with your details.

Any `blurb` fields are processed as [Markdown](http://daringfireball.net/projects/markdown/syntax) 
for formatting, and can optionally be loaded from a separate file in the same directory as 
`person.json`.If a seoparate file is to be used, the `blurb` string should be replaced with a 
JSON object with a `file` property with the filename as its value, e.g.:

	"blurb": { "file": "skills.md" }

Templating
==========

Templates should be placed in their own folder in `templates`. A file named 
`TEMPLATENAME.handlebars` must be present as this is the main HTML template used.

Any other files in this directory will be copied over to the output directory as-is.

As an example, the `basic` template is at `templates/basic/basic.handlebars` and includes an 
external CSS file called `basic.css` (but this could be named anything).

The system includes a HTML5 doctype and utf-8 meta-tag at the top of the output, anything else 
is provided by the template.

See [handlebarsjs.com](http://handlebarsjs.com/) for formatting details.
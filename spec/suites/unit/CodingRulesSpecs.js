var JSHINT = require('jshint').JSHINT,
	fs = require('fs'),
	eyes = require('eyes'),
	Step = require('step');

// This needs some work as it is reporting errors far too aggressively, I
// there is a text encoding issue at work here.
xdescribe('Coding Rules', function() {

	function getAllServerSource(callback) {
		var sourcePath = __dirname + '/../../../lib/';

		Step(
			function getSourceFilenames() {
				fs.readdir(sourcePath, this);
			},
			function readFileContents(err, filenames) {
				if (err) throw err;

				var group = this.group();
				
				filenames.forEach(function (filename) {
					if (/\.js$/.test(filename)) {
						fs.readFile(sourcePath + filename, 'utf8', group());
					}
				});
			},
			callback
		);

	}

	it('server source should passs JSHint validation', function() {
		var passedValidation,
			self = this,
			jshintOptions = { node: true, onevar: false };

		getAllServerSource(function andRunJSHint(err, filecontents) {
			if (err) throw err;

			passedValidation = JSHINT(filecontents, jshintOptions);

			JSHINT.errors.forEach(function addResultFor(error) {
				if (!error) return;
				self.addMatcherResult(new jasmine.ExpectationResult({
					passed: false,
					message: 'line ' + error.line + ': ' + error.reason
				}));
			});
		});

		waitsFor(function theResultsToBeIn() {
			return passedValidation != null;
		});

		expect(true).toBe(true); // force spec to show up if there are no errors
	});

});

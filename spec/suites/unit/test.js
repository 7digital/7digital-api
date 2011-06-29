var fs = require('fs'),
	Step = require('step');

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

		getAllServerSource(function andRunJSHint(err, filecontents) {
			if (err) throw err;

			console.log(filecontents);
			// passedValidation = JSHINT(filecontents, jshintOptions);
			
			// JSHINT.errors.forEach(function addResultFor(error) {
				// if (!error) return;
				// self.addMatcherResult(new jasmine.ExpectationResult({
					// passed: false,
					// message: "line " + error.line + ': ' + error.reason
				// }));
			// });
		});
		

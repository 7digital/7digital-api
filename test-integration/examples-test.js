'use strict';

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var examples = fs.readdirSync(path.join(__dirname, '../examples/'));

function runExample(name, cb) {
	return exec('node ' + path.join(__dirname, '../examples/', name), cb);
}

function getExamples(cb) {
}

examples.forEach(function (name) {
	describe(name, function () {
		it('does not error', function (done) {
			runExample('customconfig.js', assertOutput);
			function assertOutput(err, stdout, stderr) {
				assert.equal(err, null, 'Expected example not to error');
				assert.notEqual(stdout, '', 'Expected some output');
				assert.notMatch(stdout, /[Ee]rror/g,
					'Expected no error in output');
				done();
			}
		});
	});
});

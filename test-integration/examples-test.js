'use strict';

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var examples = fs.readdirSync(path.join(__dirname, '../examples/')).filter(function (file) {
	return file !== 'oauth.js';
});

function runExample(name, cb) {
	return exec('node ' + path.join(__dirname, '../examples/', name), cb);
}

examples.forEach(function (name) {
	describe(name, function () {
		it('does not error', function (done) {
			this.timeout(10000);
			runExample(name, assertOutput);
			function assertOutput(err, stdout, stderr) {
				assert(!err, 'Expected example not to error');
				assert.notEqual(stdout, '', 'Expected some output');
				assert.notMatch(stdout, /error/gi,
					'Expected no error in output');
				assert.notMatch(stderr, /error/gi,
					'Expected no error in output');
				done();
			}
		});
	});
});

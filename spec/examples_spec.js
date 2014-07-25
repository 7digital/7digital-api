'use strict';

var exec = require('child_process').exec;
var path = require('path');
var assert = require('chai').assert;

function runExample(name, cb) {
	return exec('node ' + path.join(__dirname, '../examples/', name), cb);
}

describe('Examples', function() {

	describe('CustomConfig example', function() {


		it('returns some releases', function(done) {
			runExample('customconfig.js', assertOutput);
			function assertOutput(err, stdout, stderr) {
				assert.equal(err, null);
				assert.match(stdout, /releases/);
				done();
			}
		});
	});

	describe('SimpleClient example', function() {

		it('returns some releases', function(done) {
			runExample('simpleclient.js', assertOutput);
			function assertOutput(err, stdout, stderr) {
				assert.equal(err, null);
				assert.match(stdout, /releases/);
				done();
			}
		});

	});

	describe('Default Action  example', function() {

		it('should return return some tags', function(done) {
			runExample('default-action.js', assertOutput);
			function assertOutput(err, stdout, stderr) {
				assert.equal(err, null);
				assert.match(stdout, /tags/);
				done();
			}
		});

	});
});

var expect = require('chai').expect;

describe('Examples', function() {

	describe('CustomConfig example', function() {

		var exec = require('child_process').exec,
			path = require('path');

		it('should return return some releases', function(done) {
			exec('node ' + path.join(__dirname, '../examples/customconfig.js'),
				function assertOutput(err, stdout, stderr) {
					expect(err).to.equal(null);
					expect(stdout).to.match(/releases/);
					done();
			});
		});

	});

	describe('SimpleClient example', function() {

		var exec = require('child_process').exec,
			path = require('path');

		it('should return return some releases', function(done) {
			exec('node ' + path.join(__dirname, '../examples/simpleclient.js'),
				function assertOutput(err, stdout, stderr) {
					expect(err).to.be.null;
					expect(stdout).to.match(/releases/);
					done();
			});
		});

	});

	describe('Default Action  example', function() {

		var exec = require('child_process').exec,
			path = require('path');

		it('should return return some tags', function(done) {
			exec('node ' + path.join(__dirname, '../examples/default-action.js'),
				function assertOutput(err, stdout, stderr) {
					expect(err).to.be.null;
					expect(stdout).to.match(/tags/);
					done();
			});
		});

	});
});

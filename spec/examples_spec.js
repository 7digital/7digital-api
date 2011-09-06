describe('Examples', function() {

	describe('CustomConfig example', function() {

		var exec = require('child_process').exec,
			path = require('path');

		it('should return return some releases', function() {
			var processReturned = false;
			exec('node ' + path.join(__dirname, '../examples/customconfig.js'),
				function assertOutput(err, stdout, stderr) {
					var result;

					expect(err).toBeFalsy();
					expect(stderr).toBeFalsy();
					expect(stdout).toMatch('releases');
					processReturned = true;
			});

			waitsFor(function () {
				return processReturned;
			}, "Timed out waiting for process to return", 5000);
		});

	});

	describe('SimpleClient example', function() {

		var exec = require('child_process').exec,
			path = require('path');

		it('should return return some releases', function() {
			var processReturned = false;
			exec('node ' + path.join(__dirname, '../examples/simpleclient.js'),
				function assertOutput(err, stdout, stderr) {
					var result;

					expect(err).toBeFalsy();
					expect(stderr).toBeFalsy();
					expect(stdout).toMatch('releases');
					processReturned = true;
			});

			waitsFor(function () {
				return processReturned;
			}, "Timed out waiting for process to return", 5000);
		});

	});

	describe('Default Action  example', function() {

		var exec = require('child_process').exec,
			path = require('path');

		it('should return return some tags', function() {
			var processReturned = false;
			exec('node ' + path.join(__dirname, '../examples/default-action.js'),
				function assertOutput(err, stdout, stderr) {
					var result;

					expect(err).toBeFalsy();
					expect(stderr).toBeFalsy();
					expect(stdout).toMatch('tags');
					processReturned = true;
			});

			waitsFor(function () {
				return processReturned;
			}, "Timed out waiting for process to return", 5000);
		});

	});
});

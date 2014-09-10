'use strict';

var fs = require('fs');
var path = require('path');
var config = require('../config');

var schema = require('../assets/7digital-api-schema');

schema.host = 'localhost';
schema.port = '3000';
schema.prefix = undefined;

var Api = require('../lib/api').Api;

var api = new Api({
	format: 'json',
	logger: require('../lib/logger')
}, schema);

var assert = require('chai').assert;

describe('api', function () {
	var childProcess = require('child_process');
	var serverProcess;
	var processStarted;

	before(function (done) {
		var nodeProcessPath;
		try {
			nodeProcessPath = require.resolve('api-stub');
		} catch (e) {
			console.log('Make sure api-stub module is installed!');
			done(e);
		}

		console.log('spawning node api-stub process : ', nodeProcessPath,
			'\n');

		serverProcess = childProcess.spawn('node', [nodeProcessPath], {});

		serverProcess.stdout.on('data', function (data) {
			if (!processStarted) {
				processStarted = true;
				done();
			}
		});

		serverProcess.stderr.on('data', function (data) {
			console.log('' + data);
		});
	});

	after(function () {
		console.log('\nshutting down api-stub process');
		serverProcess.kill('SIGKILL');
	});

	it('ensures empty basketItems is an array', function (done) {
		var basket = new api.Basket();
		basket.create(function (err, data) {
			assert.instanceOf(data.basket.basketItems, Array);
			done();
		});
	});

	it('ensures release formats is an array', function (done) {
		var release = new api.Releases();
		release.getDetails({ releaseId: 2431 }, function (err, data) {
			assert.instanceOf(data.release.formats.format, Array);
			done();
		});
	});

	it('ensures editorial list items is an array', function (done) {
		var editorial = new api.Editorial();
		editorial.getList({ key: 'home2', shopId: 34 },
			function (err, data) {

			assert.instanceOf(data.list.listItems.listItem, Array);
			done();
		});
	});

	it('ensures search results searchResult is an array', function (done) {
		var tracks = new api.Tracks();
		tracks.search({ q: 'timbalake' }, function (err, data) {
			assert.instanceOf(data.searchResults.searchResult, Array);
			done();
		});

	});

	it('gets a release by id', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 1192901 }, function (err, data) {
			assert.equal(data.release.title, 'Wasting Light');
			done();
		});
	});

	it('handles bad xml from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'error' }, function (err, data) {
			assert(err);
			done();
		});
	});

	it('handles missing resources from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'missing' }, function (err, data) {
			assert(err);
			assert.equal(err.code, '2001');
			done();
		});
	});

	it('handles unexpected but valid xml from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'strangeResponse' },
			function (err, data) {

			assert(err);
			assert.equal(err.message, 'unexpected response returned by api');
			done();
		});
	});

	it('handles unrecognised statuses from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'unrecognisedStatus' },
			function (err, data) {

			assert(err);
			assert.match(err.message, /^unrecognised response status/);
			done();
		});
	});

	describe('when using a cache', function () {
		var res;

		before(function (done) {
			var pathToXml = path.join(__dirname,
				'../test/responses/release-tracks-singletrack.xml');

			fs.readFile(pathToXml, function (err, data) {
				if (err) { return done(err); }
				res = data;
				done();
			});
		});

		it('doesn\'t error when using a cache', function (done) {
			var cache = {
				set: function () {},
				get: function (key, cb) {
					return cb(null, {
						body: res,
						headers: { 'content-type': 'application/xml' }
					});
				}
			};
			var releases = new api.Releases({
				cache: cache
			});

			releases.getDetails({ releaseId: 1192901 }, function (err, data) {
				assert(!err);
				assert(data);
				done();
			});
		});
	});
});

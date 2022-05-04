'use strict';
var assert = require('chai').assert;
var _ = require('lodash');
var winston = require('winston');

function createClient() {
	var schema = _.clone(require('../assets/7digital-api-schema.json'));

	schema.host = schema.sslHost = 'localhost';
	schema.port = 9876;
	schema.prefix = undefined;

	var api = require('../').configure({
		logger: new winston.Logger({
			transports: [ new winston.transports.Console({ level: 'error' }) ]
		})
	}, schema);

	api.IS_STUB_CLIENT = true;

	return api;
}

describe('api', function () {
	var api;
	var childProcess = require('child_process');
	var serverProcess;

	before(function (done) {
		var apiStubPath;
		try {
			apiStubPath = require.resolve('api-stub');
		} catch (e) {
			console.log('Make sure api-stub module is installed!');
			done(e);
		}

		console.log('spawning node api-stub process: ', apiStubPath, '\n');

		serverProcess = childProcess.spawn('node', [apiStubPath], {});

		var processStarted;
		serverProcess.stdout.on('data', function (data) {
			if (!processStarted) {
				processStarted = true;
				done();
			}
		});

		serverProcess.stderr.on('data', function (data) {
			console.log(data.toString());
		});

		api = createClient();
	});

	after(function () {
		console.log('\nshutting down api-stub process');
		serverProcess.kill('SIGKILL');
	});

	it('ensures empty basketItems is an array', function (done) {
		var basket = new api.Basket();
		basket.create(function (err, data) {
			assert.isNull(err);
			assert.instanceOf(data.basket.basketItems, Array);
			done();
		});
	});

	it('ensures release package formats is an array when only one format', function (done) {
		var release = new api.Releases();
		release.getDetails({ releaseId: 2431 }, function (err, data) {
			assert.isNull(err);
			assert.instanceOf(data.release.download.packages.package[0].formats.format, Array);
			done();
		});
	});

	it('ensures editorial list items is an array', function (done) {
		var editorial = new api.Editorial();
		editorial.getList({ key: 'home2', shopId: 34 }, function (err, data) {
			assert.isNull(err);
			assert.instanceOf(data.list.listItems.listItem, Array);
			done();
		});
	});

	it('ensures search results searchResult is an array', function (done) {
		var tracks = new api.Tracks();
		tracks.search({ q: 'timbalake' }, function (err, data) {
			assert.isNull(err);
			assert.instanceOf(data.searchResults.searchResult, Array);
			done();
		});

	});

	it('gets a release by id', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 1192901 }, function (err, data) {
			assert.isNull(err);
			assert.equal(data.release.title, 'Wasting Light');
			done();
		});
	});

	it('handles bad xml from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'error' }, function (err, data) {
			assert(err);
			assert.equal(err.statusCode, 200);
			done();
		});
	});

	it('handles missing resources from the api', function (done) {
		var releases = new api.Releases();
		var params = { releaseId: 'missing' };
		releases.getDetails(params, function (err, data) {
			assert(err);
			assert.equal(err.code, '2001');
			assert.deepEqual(err.params, params);
			assert.equal(err.statusCode, 404);
			done();
		});
	});

	it('handles unexpected but valid xml from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'strangeResponse' },
			function (err, data) {

			assert(err);
			assert.equal(err.message, 'Missing response node from: /release/details');
			assert.equal(err.statusCode, 200);
			done();
		});
	});

	it('handles unrecognised statuses from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'unrecognisedStatus' },
			function (err, data) {

			assert(err);
			assert.equal(err.message, 'Unexpected response status from: /release/details');
			assert.equal(err.statusCode, 200);
			done();
		});
	})

	it('returns an error when api returns a 4xx for non-HTTPS endpoint', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'missing' }, function (err) {
			assert(err);
			assert.equal(err.name, 'ApiError');
			assert.equal(err.code, '2001');
			assert.equal(err.message, 'No releases found with id: missing: /release/details');
			assert.equal(err.statusCode, 404);
			done();
		});
	});;

	it('returns an error when api returns a 4xx for HTTPS endpoint', function (done) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
		api.User().getDetails({ userId: 'invalid' }, function (err) {
			assert(err);
			assert.equal(err.name, 'ApiError');
			assert.equal(err.code, '1002');
			assert.equal(err.message, 'Value of parameter userId is not valid: invalid: /user/details');
			assert.equal(err.statusCode, 400);
			done();
		});
	});
});

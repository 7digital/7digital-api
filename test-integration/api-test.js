'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var _ = require('lodash');
var winston = require('winston');
var config = require('../config');

function createClient() {
	var schema = _.clone(
		require('../assets/7digital-api-schema.json'));
	var port = 9876;
	var logger = new winston.Logger({
		transports: [
			new winston.transports.Console({ level: 'error' })
		]
	});

	schema.host = 'localhost';
	schema.port = port;
	schema.prefix = undefined;

	var api = require('../').configure({
		logger: logger
	}, schema);

	api.IS_STUB_CLIENT = true;

	return api;
}

describe('api', function () {
	var api;
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

		api = createClient();
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

	it('ensures release package formats is an array when only one format', function (done) {
		var release = new api.Releases();
		release.getDetails({ releaseId: 2431 }, function (err, data) {
			assert.instanceOf(data.release.download.packages.package[0].formats.format, Array);
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
		var params = { releaseId: 'missing' };
		releases.getDetails(params, function (err, data) {
			assert(err);
			assert.equal(err.code, '2001');
			assert.deepEqual(err.params, params);
			done();
		});
	});

	it('handles unexpected but valid xml from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'strangeResponse' },
			function (err, data) {

			assert(err);
			assert.equal(err.message,
				'Missing response node from: /release/details');
			done();
		});
	});

	it('handles unrecognised statuses from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'unrecognisedStatus' },
			function (err, data) {

			assert(err);
			assert.equal(err.message,
					'Unexpected response status from: /release/details');
			done();
		});
	});

});

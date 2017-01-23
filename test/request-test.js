'use strict';

var _ = require('lodash');
var assert = require('chai').assert;
var request = require('../lib/request');
var RequestError = require('../lib/errors').RequestError;

describe('request', function () {

	describe('createHeaders', function () {

		it('adds the user agent and host headers', function () {
			var headers  = request.createHeaders('api.7digital.com');
			assert.equal(headers.Host, 'api.7digital.com');
			assert.equal(headers['User-Agent'], 'Node.js HTTP Client');
		});

	});

	describe('prepare', function () {

		it('adds the consumer key to the params', function () {
			var preparedData = request.prepare({}, 'YOUR_KEY_HERE');
			assert.equal(preparedData.oauth_consumer_key, 'YOUR_KEY_HERE');
		});

		it('converts dates to the correct format', function () {
			var preparedData = request.prepare({
				someParam: new Date(2005, 5, 3)
			});

			assert.equal(preparedData.someParam, '20050603');
		});

	});

	describe('dispatch', function () {
		it('calls back with the error', function (done) {
			var logger = { info: _.noop, error: _.noop };
			var hostInfo = {
				port: 80,
				host: 'wibble'
			};
			request.dispatch('', 'GET', {}, {}, hostInfo, {}, logger,
				function (err) {

				assert(err);
				assert.instanceOf(err, RequestError,
					'expected instance of RequestError');
				assert.instanceOf(err.cause(), Error);

				done();
			});
		});
	});

	describe('dispatchSecure', function () {

		it('calls back with an error for unknown verbs', function (done) {
			var logger = { info: _.noop, error: _.noop };
			request.dispatchSecure('', 'BLAH', {}, {}, null, {}, {}, logger,
				function (err) {

				assert(err);

				done();
			});
		});
	});
});

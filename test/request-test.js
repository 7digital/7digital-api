'use strict';

var _ = require('lodash');
var assert = require('chai').assert;
var request = require('../lib/request');

describe('request', function () {

	describe('createHeaders', function () {

		it('adds the expected headers', function () {
			var headers  = request.createHeaders('api.7digital.com');
			assert.equal(headers.host, 'api.7digital.com');
			assert.equal(headers['User-Agent'], 'Node.js HTTP Client');
			assert.equal(headers['Accept'], 'application/xml');
			assert.equal(headers['Content-Type'], 'application/x-www-form-urlencoded');
		});

		it('overrides content type if specified', function () {
			var headers  = request.createHeaders('api.7digital.com', { 'Content-Type' : 'application/json' });
			assert.equal(headers['Content-Type'], 'application/json');
		});
	});

	describe('prepare', function () {
		it('creates url encoded params if no content type is specified', function () {
			var input = { abc: 123, def: 'hello' };
			var preparedData = request.prepare(input, 'YOUR_KEY_HERE');
			assert.deepEqual(preparedData, input);
		});

		it('throws on an unregognised content type', function () {
			assert.throws(function () {
				request.prepare({ abc: 123, def: 'hello' }, 'YOUR_KEY_HERE', {
					contentType: 'morse code'
				});
			});
		});

		it('adds the consumer key to the params', function () {
			var preparedData = request.prepare({}, 'YOUR_KEY_HERE');
			assert.equal(preparedData.oauth_consumer_key, 'YOUR_KEY_HERE');
		});

		it('doesn\'t add the consumer key to the params if json', function () {
			var preparedData = request.prepare({}, 'YOUR_KEY_HERE', {
				contentType: 'application/json'
			});
			assert.notInclude(preparedData, 'YOUR_KEY_HERE');
		});

		it('converts dates to the correct format', function () {
			var preparedData = request.prepare({
				someParam: new Date(2005, 5, 3)
			}, 'key', { contentType: 'application/json'});

			assert.equal(JSON.parse(preparedData).someParam, '20050603');
		});

		it('maintains nested structures', function () {
			var expectedData = {
				name: 'playlist name',
				visibility: 'Public',
				tracks: [{
					trackId: '31032383',
					trackTitle: 'Valley of the shadows',
					trackVersion: 'Origin Unknown',
					artistAppearsAs: 'Origin Unknown',
					releaseId: '2908039',
					releaseTitle: 'Valley of the shadows',
					releaseAritistAppearsAs: 'Valley of the shadows',
					releaseVersion: 'Original Version',
					source: '7digital'
				}]
			};
			var preparedData = request.prepare(expectedData, 'key', { contentType: 'application/json'});

			assert.isString(preparedData);
			assert.equal(preparedData, JSON.stringify(expectedData));
		});

		it('deletes the access token and secret if the request is 2-legged', function () {
			var data = { accesstoken: 'token', accesssecret: 'secret' };
			var preparedData  = JSON.parse(request.prepare(data, 'key', { is2Legged: true, contentType: 'application/json' }));
			assert.equal(preparedData.accesstoken, 'token');
			assert.equal(preparedData.accesssecret, 'secret');
		});

		it('does not delete the access token and secret if the request is not 2-legged', function () {
			var preparedData  = JSON.parse(
				request.prepare({ accesstoken: 'afdsfsdfadsf', accesssecret: 'sgfdgsdfgfg' }, 'key', { is2Legged: false, contentType: 'application/json' })
				);
			assert.isUndefined(preparedData.accesstoken);
			assert.isUndefined(preparedData.accesssecret);
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

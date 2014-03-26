'use strict';
var expect = require('chai').expect;
var request = require('../lib/request');

describe('request', function () {

	describe('createHeaders', function () {

		it('adds the user agent and host headers', function () {
			var headers  = request.createHeaders('api.7digital.com');
			expect(headers.host).to.equal('api.7digital.com');
			expect(headers['User-Agent']).to.equal('Node.js HTTP Client');
		});

	});

	describe('prepare', function () {
		it('adds the consumer key to the params', function () {
			var preparedData = request.prepare({}, 'YOUR_KEY_HERE');
			expect(preparedData.oauth_consumer_key).to.equal('YOUR_KEY_HERE');
		});

		it('converts dates to the correct format', function () {
			var preparedData = request.prepare({
				someParam: new Date(2005, 5, 3)
			});

			expect(preparedData.someParam).to.equal('20050603');
		});
	});

});

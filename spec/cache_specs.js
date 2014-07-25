'use strict';

var assert = require('chai').assert;
var cache = require('../lib/cache');

describe('cache', function () {

	describe('generateCacheKeyFromUrl', function () {

		it('prefixes a hash', function () {
			var key = cache.generateCacheKeyFromUrl('/foo');
			assert.equal(key.indexOf('7digital-api:'), 0);
		});

	});

	describe('parseMaxAgeHeader', function () {

		it('parses the header', function () {
			var res = {
				headers: {
					"cache-control": "max-age=600"
				}
			};
			var maxAge = cache.parseMaxAgeHeader(res);
			assert.equal(maxAge, 600);
		});

	});

});

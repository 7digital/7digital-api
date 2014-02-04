var expect = require('chai').expect;
var cache = require('../lib/cache');

describe('cache', function () {

	describe('generateCacheKeyFromUrl', function () {

		it('prefixes a hash', function () {
			var key = cache.generateCacheKeyFromUrl('/foo');
			expect(key.indexOf('7digital-api:')).to.equal(0);
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
			expect(maxAge).to.equal(600);
		});

	});

});

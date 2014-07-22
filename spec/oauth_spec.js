'use strict';

var assert = require('chai').assert;
var api = require('../index');

describe('OAuth', function() {

	var oauth;

	beforeEach(function() {
		oauth = new api.OAuth();
	});

	it('should have a sign helper', function() {
		assert(oauth.sign);
		assert.isFunction(oauth.sign);
	});

	it('should allow overriding default parameters', function () {
		var oauth2 = new api.OAuth({
			defaultParams: {
				country: 'fr'
			}
		});

		assert.equal(oauth2.defaultParams.country, 'fr');
	});

});

'use strict';

var assert = require('chai').assert;

describe('config', function() {
	var config = require('../config');

	it('should have the default consumer key', function() {
		assert.equal(config.consumerkey, 'YOUR_KEY_HERE');
	});

	it('should have an empty oauthsecret', function() {
		assert.equal(config.consumersecret, 'YOUR_SECRET_HERE');
	});

	it('should have the response format set to JSON by default', function() {
		assert.equal(config.format, 'json');
	});

});

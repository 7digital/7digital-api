'use strict';

var assert = require('chai').assert;
var withEnv = require('./util').withEnv;
var uncachedRequire = require('./util').uncachedRequire;

describe('config', function() {
	var config;

	beforeEach(function () {
		config = uncachedRequire('../config');
	});

	it('should have the default consumer key', function () {
		withEnv('_7D_API_CLIENT_CONSUMER_KEY', '', function () {
			config = uncachedRequire('../config');
			assert.equal(config.consumerkey, 'YOUR_KEY_HERE');
		});
	});

	it('should have an empty oauthsecret', function () {
		withEnv('_7D_API_CLIENT_CONSUMER_SECRET', '',
			function () {
			config = uncachedRequire('../config');
			assert.equal(config.consumersecret, 'YOUR_SECRET_HERE');
		});
	});

	it('should get the consumer key from the environment', function () {
		withEnv('_7D_API_CLIENT_CONSUMER_KEY', 'CUSTOM_API_KEY', function () {
			config = uncachedRequire('../config');
			assert.equal(config.consumerkey, 'CUSTOM_API_KEY');
		});
	});

	it('should get the consumer secret from the environment', function () {
		withEnv('_7D_API_CLIENT_CONSUMER_SECRET', 'CUSTOM_API_SECRET',
			function () {

			config = uncachedRequire('../config');
			assert.equal(config.consumersecret, 'CUSTOM_API_SECRET');
		});
	});

	it('should have the response format set to JSON by default', function () {
		assert.equal(config.format, 'json');
	});
	
	it('should default to using the download usage type', function () {
		assert.deepEqual(config.defaultParams, {usageTypes: 'download'});
	});
});

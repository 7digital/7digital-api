'use strict';

var assert = require('chai').assert;

var Api = require('../lib/api').Api;

describe('API.build', function() {
	var schema = {
		"host": "api.example.com",
		"version": "1.0",
		"resources":
			{
				"Test": {
					"resource": "testresource",
					"actions":
					[
						"byDate"
					]
				}
			}
		}, api, testApi;

	beforeEach(function() {
		api = Api.build({
			consumerkey: 'YOUR_KEY_HERE',
			consumersecret: 'YOUR_SECRET_HERE',
			format: 'json',
			logger: { silly: function () {} }
		}, schema);

		testApi = new api.Test();
	});

	it('should return a wrapper', function() {
		assert(api);
	});

	it('should create an API constructor for each resource', function() {
		assert(api.Test);
	});

	it('should supply oauth key and secret when provided', function() {
		api = Api.build({
			consumerkey: 'testkey',
			consumersecret: 'testsecret',
			format: 'json',
			logger: { silly: function () {} }
		}, schema);

		testApi = new api.Test();

		assert.strictEqual(testApi.consumerkey, 'testkey');
		assert.strictEqual(testApi.consumersecret, 'testsecret');
	});

	it('should supply the API with host, version and resource name',
		function() {
		assert.strictEqual(testApi.host, 'api.example.com');
		assert.strictEqual(testApi.version, '1.0');
		assert.strictEqual(testApi.resourceName, 'testresource');
	});

	it('should create a method for each action', function() {
		assert(testApi.getByDate);
		assert.isFunction(testApi.getByDate);
	});

	it('should allow hierarchical default parameters', function() {
		api = Api.build({
			consumerkey: 'testkey',
			consumersecret: 'testsecret',
			format: 'json',
			logger: { silly: function () {} },
			defaultParams: { country: 'fr' }
		}, schema);

		testApi = new api.Test({ defaultParams: { pageSize: 5 }});

		assert.deepEqual(testApi.defaultParams, {
			country: 'fr',
			pageSize: 5
		});
	});

});

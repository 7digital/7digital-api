'use strict';

var _ = require('lodash');
var assert = require('chai').assert;
var Api = require('../lib/api').Api;
var withEnv = require('./util').withEnv;

function createSchema() {
	return _.cloneDeep({
		"host": "api.example.com",
		"prefix": "1.0",
		"resources":
			{
				"Test": {
					"resource": "testresource",
					"actions":
					[
						"byDate"
					]
				},
				"Other": {
					"resource": "testresource",
					"host": "api.other.com",
					"port": 8080,
					"prefix": "public",
					"actions": [
						{ "apiCall": "byDate", "methodName": "getByDate" },
						{
							"apiCall": "overridden",
							"host": "api.acme.com",
							"port": 3000,
							"prefix": "foo",
							"methodName": "isOverridden"
						},
					]
				}
			}
		});
}

describe('API.build', function() {
	var schema, api, testApi;

	beforeEach(function() {
		schema = createSchema();
		api = Api.build({
			consumerkey: 'YOUR_KEY_HERE',
			consumersecret: 'YOUR_SECRET_HERE',
			format: 'json',
			logger: { silly: function () {} }
		}, schema);

		testApi = new api.Test();
	});

	it('returns a wrapper', function() {
		assert(api);
	});

	it('creates an API constructor for each resource', function() {
		assert(api.Test);
	});

	it('allows creation of resources without new', function () {
		var res = api.Test();
		assert(res);
		assert.instanceOf(res, require('../lib/resource'));
	});

	it('gives resources the provided oauth key and secret', function() {

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

	it('gives resources the supplied host, prefix and resource name',
		function() {
		assert.strictEqual(testApi.host, 'api.example.com');
		assert.strictEqual(testApi.prefix, '1.0');
		assert.strictEqual(testApi.resourceName, 'testresource');
	});

	it('overrides API host, prefix and port on a resource',
		function() {
		var other = new api.Other();
		assert.strictEqual(other.host, 'api.other.com');
		assert.strictEqual(other.prefix, 'public');
		assert.strictEqual(other.port, 8080);
	});

	it('overrides the API host, prefix and port on an action',
		function() {
		var other = new api.Other();
		assert.strictEqual(other.isOverridden.host, 'api.acme.com');
		assert.strictEqual(other.isOverridden.prefix, 'foo');
		assert.strictEqual(other.isOverridden.port, 3000);
	});

	it('overrides the API host, prefix and port from the environment',
		function () {
		var vars = {
			'_7D_API_CLIENT_HOST': 'localhost',
			'_7D_API_CLIENT_PORT': '8000',
			'_7D_API_CLIENT_PREFIX': 'empty'
		};

		withEnv(vars, function () {
			var api = Api.build({
			consumerkey: 'testkey',
			consumersecret: 'testsecret',
			format: 'json',
			logger: { silly: function () {} }
		}, schema);
			var testApi = new api.Test();
			assert.strictEqual(testApi.host, 'localhost');
			assert.strictEqual(testApi.prefix, '');
			assert.strictEqual(testApi.port, 8000);
		});
	});

	it('ignores non-number ports from the environment',
		function () {
		var vars = {
			'_7D_API_CLIENT_PORT': 'not-a-number'
		};

		withEnv(vars, function () {
			var api = Api.build({
			consumerkey: 'testkey',
			consumersecret: 'testsecret',
			format: 'json',
			logger: { silly: function () {} }
		}, schema);
			var testApi = new api.Test();
			assert.isUndefined(testApi.port);
		});
	});

	it('sets prefix to empty string when environment is \'empty\'',
		function () {
		var vars = {
			'_7D_API_CLIENT_PREFIX': 'empty'
		};

		withEnv(vars, function () {
			var api = Api.build({
			consumerkey: 'testkey',
			consumersecret: 'testsecret',
			format: 'json',
			logger: { silly: function () {} }
		}, schema);
			var testApi = new api.Test();
			assert.strictEqual(testApi.prefix, '');
		});
	});

	it('creates a method for each action', function() {
		assert(testApi.getByDate);
		assert.isFunction(testApi.getByDate);
	});

	it('creates a 3-legged user action when not managed', function() {
		var api = Api.buildDefault();
		assert.isFunction(api.User().getLocker);
		assert.equal(api.User().getLocker.authtype, '3-legged');
	});

	it('creates a 2-legged user action when managed', function() {
		var api = Api.buildDefault({ userManagement: true });
		assert.isFunction(api.User().getLocker);
		assert.equal(api.User().getLocker.authtype, '2-legged');
	});

	it('allows hierarchical default parameters', function() {
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

	it('allows reconfiguration of the client', function() {
		function createLogger(label) {
			return {
				label: label,
				silly: function () {}
			};
		}
		api = Api.build({
			consumerkey: 'testkey',
			consumersecret: 'testsecret',
			format: 'json',
			logger: createLogger('logger1')
		}, schema);

		var api2 = api.reconfigure({
			logger: createLogger('logger2'),
			headers: {
				'foo': 'bar'
			},
			defaultParams: {
				page: 2
			}
		});

		var api3 = api2.reconfigure({
			headers: {
				'baz': 'quux'
			},
			defaultParams: {
				country: 'fr'
			}
		});

		var testApi = new api.Test({
			headers: {
				'resource-header': 1
			},
			defaultParams: { pageSize: 5 }
		});
		var testApi2 = new api2.Test({
			headers: {
				'resource-header': 2
			},
			defaultParams: { pageSize: 6 }
		});
		var testApi3 = new api3.Test({
			headers: {
				'resource-header': 3
			},
			defaultParams: { pageSize: 7 }
		});

		assert.equal(testApi.logger.label, 'logger1');
		assert.equal(testApi2.logger.label, 'logger2');
		assert.equal(testApi3.logger.label, 'logger2');

		assert.deepEqual(testApi.defaultParams, {
			pageSize: 5,
			usageTypes: 'download'
		});
		assert.deepEqual(testApi.headers, {
			'resource-header':1
		});
		assert.deepEqual(testApi2.defaultParams, {
			page: 2,
			pageSize: 6,
			usageTypes: 'download'
		});
		assert.deepEqual(testApi2.headers, {
			'resource-header': 2,
			foo: 'bar'
		});
		assert.deepEqual(testApi3.defaultParams, {
			page: 2,
			pageSize: 7,
			country: 'fr',
			usageTypes: 'download'
		});
		assert.deepEqual(testApi3.headers, {
			'resource-header': 3,
			foo: 'bar',
			baz: 'quux'
		});
	});
});

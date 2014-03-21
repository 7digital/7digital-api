var expect = require('chai').expect;

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
			schema: schema,
			consumerkey: 'YOUR_KEY_HERE',
			consumersecret: 'YOUR_SECRET_HERE',
			format: 'json',
			logger: { silly: function () {} }
		}),
		testApi = new api.Test();
	});

	it('should return a wrapper', function() {
		expect(api).not.to.be.null;
	});

	it('should create an API constructor for each resource', function() {
		expect(api.Test).to.exist;
	});

	it('should supply oauth key and secret when provided', function() {
		api = Api.build({
			schema: schema,
			consumerkey: 'testkey',
			consumersecret: 'testsecret',
			format: 'json',
			logger: { silly: function () {} }
		});

		testApi = new api.Test();

		expect(testApi.consumerkey).to.equal('testkey');
		expect(testApi.consumersecret).to.equal('testsecret');
	});

	it('should supply the API with host, version and resource name',
		function() {
		expect(testApi.host).to.equal('api.example.com');
		expect(testApi.version).to.equal('1.0');
		expect(testApi.resourceName).to.equal('testresource');
	});

	it('should create a method for each action', function() {
		expect(testApi.getByDate).to.exist;
		expect(testApi.getByDate).to.be.a('function');
	});

});

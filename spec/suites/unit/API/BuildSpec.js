require('../../../helpers/Matchers.js');

var Api = require('../../../../lib/api').Api;

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
		api = Api.build({ schema: schema }),
		testApi = new api.Test();
	});
	
	it('should return a wrapper', function() {
		expect(api).not.toBeNull();
	});
	
	it('should create an API constructor for each resource', function() {
		expect(api.Test).toBeDefined();
	});
	
	it('should supply oauth key and secret when provided', function() {
		api = Api.build({
			schema: schema, 
			consumerkey: 'testkey', 
			consumersecret: 'testsecret'
		});

		testApi = new api.Test();

		expect(testApi.consumerkey).toEqual('testkey');
		expect(testApi.consumersecret).toEqual('testsecret');
	});
	
	it('should supply the API with host, version and resource name', function() {
		expect(testApi.host).toEqual('api.example.com');
		expect(testApi.version).toEqual('1.0');
		expect(testApi.version).toEqual('1.0');
	});
	
	it('should create a method for each action', function() {
		expect(testApi.getByDate).toBeDefined();
		expect(testApi.getByDate).toBeAFunction();
	});
	
});

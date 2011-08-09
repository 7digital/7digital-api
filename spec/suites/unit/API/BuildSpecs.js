require('../../../helpers/Matchers.js');

var Api = require('../../../../lib/api').Api,
	APIBase = require('../../../../lib/apibase').APIBase;

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
		api = Api.build(schema),
		testApi = new api.Test();
	});
	
	it('should return a wrapper', function() {
		expect(api).not.toBeNull();
	});
	
	it('should create an API constructor for each resource', function() {
		expect(api.Test).toBeDefined();
		expect(api.Test).toHavePrototypeOf(APIBase);
	});
	
	it('should supply oauth key and secret when provided', function() {
		// This is a bit smelly, we're essentially setting up the API
		// twice which suggests we need a new fixture really.
		api = Api.build(schema, 'testkey', 'testsecret');
		testApi = new api.Test(); 
		
		expect(testApi.oauth_consumer_key).toEqual('testkey');
		expect(testApi.oauth_consumer_secret).toEqual('testsecret');
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

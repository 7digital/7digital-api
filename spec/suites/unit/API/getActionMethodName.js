require('../../../helpers/Matchers.js');

var Api = require('../../../../lib/api').Api,
	APIBase = require('../../../../lib/apibase').APIBase;

describe('API.getActionMethodName', function() {
	var schema = {
		"host": "api.example.com",
		"version": "1.0",
		"resources": 
			{
				"Test": {
					"resource": "testresource",
					"actions":
					[ 
						"byDate",
						{ "apiCall": "test", "methodName": "expectedName" }
					]
				}
			}
		}, api, testApi;
		
	beforeEach(function() {
		api = Api.build(schema),
		testApi = new api.Test();
	});
	
	it('should return an empty string when no action is found', function() {
		var methodName = api.getActionMethodName('Test', 'nonexistentactionslug');
		expect(methodName).toEqual('');
	});
	
	it('should default to getXxx when no methodName is specified in the schema', function() {
		var methodName = api.getActionMethodName('Test', 'byDate');
		expect(methodName).toEqual('getByDate');
	});

	it('should default to getXxx when no methodName is specified in the schema even with the wrong case', function() {
		var methodName = api.getActionMethodName('Test', 'BYDATE');
		expect(methodName).toEqual('getByDate');
	});

	it('should return specified methodName when in the schema', function() {
		var methodName = api.getActionMethodName('Test', 'test');
		expect(methodName).toEqual('expectedName');
	});

	it('should specified methodName when in the schema even with the wrong case', function() {
		var methodName = api.getActionMethodName('Test', 'TEST');
		expect(methodName).toEqual('expectedName');
	});
});

var config = require('../../../../config').Config

describe('config', function() {

	it('should have the default consumer key', function() {
		expect(config.oauthkey).toEqual('YOUR_KEY_HERE');
	});	

	it('should have an empty oauthsecret', function() {
		expect(config.oauthsecret).toEqual('');
	});

	it('should have the path to the schema json', function() {
		expect(config.schemapath).toEqual('lib/api.json');
	});

});

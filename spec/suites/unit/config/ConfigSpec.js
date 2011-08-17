var config = require('../../../../config').Config

describe('config', function() {
	it('should have the default consumer key', function() {
		expect(config.oauthkey).toEqual('YOUR_KEY_HERE');
	});	

	it('should have an empty oauthsecret', function() {
		expect(config.oauthsecret).toEqual('YOUR_SECRET_HERE');
	});

	it('should have the path to the schema json', function() {
		expect(config.schemapath).toEqual('lib/api.json');
	});

	it('should have debug', function() {
		expect(config.debug).toEqual(true);
	});
  
  it('should have the response format set to JSON by default', function() {
    expect(config.format).toEqual('json');
  });
});

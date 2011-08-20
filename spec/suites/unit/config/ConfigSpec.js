describe('config', function() {
	var config = require('../../../../config').Config

	it('should have the default consumer key', function() {
		expect(config.consumerkey).toEqual('YOUR_KEY_HERE');
	});	

	it('should have an empty oauthsecret', function() {
		expect(config.consumersecret).toEqual('YOUR_SECRET_HERE');
	});

	it('should have the path to the schema json', function() {
		expect(config.schemapath).toMatch(/lib\/api.json$/);
	});

	it('should have debug', function() {
		expect(config.debug).toEqual(true);
	});
  
  it('should have the response format set to JSON by default', function() {
    expect(config.format).toEqual('json');
  });
});

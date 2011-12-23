var sevendigital = require("../index");

require('./custom-matchers.js');

describe('Module entry point', function() {

	it('should be the built 7digital API wrapper', function() {
		expect(sevendigital.Artists).toBeDefined();
		expect(sevendigital.Artists).toBeAFunction();
	});

});

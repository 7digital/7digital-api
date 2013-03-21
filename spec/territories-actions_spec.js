var winston = require('winston'),
	api = require('../index').configure({
		logger: new winston.Logger({ transports: [] })
	});

require('./custom-matchers.js');

describe("Territories actions", function() {

	var releases;

	beforeEach(function() {
		territories = new api.Territories();
	});

	it("should generate a getCountries method for the default action", function() {
		expect(territories.getCountries).toBeDefined();
		expect(territories.getCountries).toBeAFunction();
	});
});

var expect = require('chai').expect;
var api = require('../index');

describe("Territories actions", function() {

	var releases;

	beforeEach(function() {
		territories = new api.Territories();
	});

	it("should generate a getCountries method for the default action", function() {
		expect(territories.getCountries).to.exist;
		expect(territories.getCountries).to.be.a('function');
	});
});

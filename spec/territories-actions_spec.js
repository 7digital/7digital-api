'use strict';

var assert = require('chai').assert;
var api = require('../index');

describe("Territories actions", function() {

	var territories;

	beforeEach(function() {
		territories = new api.Territories();
	});

	it("should generate a getCountries method for the default action", function() {
		assert(territories.getCountries);
		assert.isFunction(territories.getCountries);
	});
});

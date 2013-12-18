var expect = require('chai').expect;
var sevendigital = require("../index");

describe('Module entry point', function() {

	it('should be the built 7digital API wrapper', function() {
		expect(sevendigital.Artists).to.exist;
		expect(sevendigital.Artists).to.be.a('function');
	});

	it('should expose the schema', function() {
		expect(sevendigital.schema.host).to.exist;
	});

});

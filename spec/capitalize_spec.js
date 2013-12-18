var expect = require('chai').expect;

var helpers = require('../lib/helpers');

describe('helpers.capitalize', function() {
	it('should capitalise the first letter of a string', function() {
		var result = helpers.capitalize('seven');
		expect(result[0]).to.equal('S');
		expect(result).to.equal('Seven');
	});

});

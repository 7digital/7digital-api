var expect = require('chai').expect;
var api = require('../index');

describe("Tags actions", function() {

	var releases;

	beforeEach(function() {
		tags = new api.Tags();
	});

	it("should generate an all method for the default action", function() {
		expect(tags.all).to.exist;
		expect(tags.all).to.be.a('function');
	});

});

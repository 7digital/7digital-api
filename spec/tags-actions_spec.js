'use strict';

var assert = require('chai').assert;
var api = require('../index');

describe("Tags actions", function() {

	var tags;

	beforeEach(function() {
		tags = new api.Tags();
	});

	it("should generate an all method for the default action", function() {
		assert(tags.all);
		assert.isFunction(tags.all);
	});

});

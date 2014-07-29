'use strict';

var assert = require('chai').assert;
var helpers = require('../lib/helpers');

describe('padComponent', function() {

	it('returns a string with a leading zero when a single digit', function() {
		var result = helpers.padComponent(9);
		assert.equal(result, '09');
	});

	it('returns a string with when more than 9', function() {
		var result = helpers.padComponent(10);
		assert.equal(result, '10');
	});

});

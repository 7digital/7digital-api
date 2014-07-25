'use strict';

var assert = require('chai').assert;
var helpers = require('../lib/helpers');

describe('helpers.capitalize', function() {

	it('capitalises the first letter of a string', function() {
		var result = helpers.capitalize('seven');
		assert.equal(result[0], 'S');
		assert.equal(result, 'Seven');
	});

});

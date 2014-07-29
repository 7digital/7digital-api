'use strict';

var assert = require('chai').assert;
var helpers = require('../lib/helpers');

describe('toYYYYMMDD', function() {

	it('should return formatted the date string', function() {
		var theDate = new Date('October 13, 1975 12:00:00');
		var result = helpers.toYYYYMMDD(theDate);
		assert.equal(result, '19751013');
	});

});

var expect = require('chai').expect;
var helpers = require('../lib/helpers');

describe("toYYYYMMDD", function() {
	
	it('should return formatted the date string', function() {
		var theDate = new Date("October 13, 1975 12:00:00");
		var result = helpers.toYYYYMMDD(theDate);
		expect(result).to.equal('19751013');
	});
	
});

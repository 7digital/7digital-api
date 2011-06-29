var DateUtils = require('dateutils').DateUtils;

describe("DateUtils.isDate", function() {
	
	it('should return true when given a date', function() {
		var theDate = new Date("October 13, 1975 12:00:00");
		var result = DateUtils.isDate(theDate);
		expect(result).toBeTruthy();
	});

});
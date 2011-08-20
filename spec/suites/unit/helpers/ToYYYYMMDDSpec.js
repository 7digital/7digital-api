var helpers = require('../../../../lib/helpers');

describe("DateUtils.toYYYYMMDD", function() {
	
	it('should return format the date string', function() {
		var theDate = new Date("October 13, 1975 12:00:00");
		var result = helpers.toYYYYMMDD(theDate);
		expect(result).toEqual('19751013');
	});
	
});

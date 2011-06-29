var DateUtils = require('dateutils').DateUtils;

describe("DateUtils.padComponent", function() {
	
	it('should return a string with a leading zero when less than or equal to 9', function() {
		var result = DateUtils.padComponent(9);
		expect(result).toEqual('09');
	});
	
	it('should return a string with when more than 9', function() {
		var result = DateUtils.padComponent(10);
		expect(result).toEqual('10');
	});

});
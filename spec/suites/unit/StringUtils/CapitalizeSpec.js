var StringUtils = require('../../../../lib/stringutils').StringUtils;

describe('StringUtils.capitalize', function() {
	
	it('should capitalise the first letter of a string', function() {
		var result = StringUtils.capitalize('seven');
		expect(result[0]).toEqual('S');
		expect(result).toEqual('Seven');
	});
	
});

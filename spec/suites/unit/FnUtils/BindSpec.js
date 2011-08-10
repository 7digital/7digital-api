var FnUtils = require('../../../../lib/fnutils').FnUtils;

describe('FnUtils.bind', function() {
	
	it('should set the function scope', function() {
		// Arrange
		var actualScope,
			expectedScope = { 'billy': 'goat '},
			original = function () {
				actualScope = this;
		},
		bound = FnUtils.bind(expectedScope, original);
		
		// Act
		bound();
		
		// Assert
		expect(actualScope).toBe(actualScope);
	});
	
});

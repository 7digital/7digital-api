var FnUtils = require('fnutils').FnUtils;

describe('FnUtils.curry', function() {
	
	it('should supply the first argument in curried functions', function() {
		// Arrange
		var suppliedFirst,
			suppliedSecond,
			original = function (first, second) {
				suppliedFirst = first;
				suppliedSecond = second;				
		},
		curried = FnUtils.curry(original, 42);
		
		// Act
		curried('the life the universe and everything');
		
		// Assert
		expect(suppliedFirst).toEqual(42);
		expect(suppliedSecond).toEqual('the life the universe and everything');
	});
	
});
var api = require('../index'),
	API_TIMEOUT_MS = 5000;

require('./Matchers.js');

describe('Basket Integration Tests', function() {
	var basket;

	beforeEach(function() {
		basket = new api.Basket();
		this.addMatchers({
			toHaveOkStatus: function() {
				return this.actual['@'].status === 'ok';
			}
		});
	});
	
	it("should return new basket from get after creating one", function() {
    pending()
		var errorData,
			successData;
		
		basket.create({}, function(err, data) {
			var basketId = data.basket['@'].id;
			basket.get({ basketId: basketId }, function(err, data) {
				errorData = err;
				successData = data;
			});
		});
		
		waitsFor(function() {
			return errorData || successData;
		}, "api timed out", API_TIMEOUT_MS);
		
		runs(function() {
			expect(errorData).toBeFalsy();
			expect(successData).not.toBeFalsy();
			expect(successData).toHaveOkStatus();
		});		
	});
	
});

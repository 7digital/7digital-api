require('../../../helpers/Matchers.js');
var api = require('../../../../lib/api').Api.buildFromFile(__dirname + '/../../../../lib/api.json');

describe("Basket actions", function() {

	var basket;
	
	beforeEach(function() {
		basket = new api.Basket();
	});
	
	it("should generate a create method for the create action", function() {
		expect(basket.create).toBeDefined();
		expect(basket.create).toBeAFunction();
	});
		
	it("should generate a get method for the default action", function() {
		expect(basket.get).toBeDefined();
		expect(basket.get).toBeAFunction();
	});

	it("should generate an addItem method for the addItem action", function() {
		expect(basket.addItem).toBeDefined();
		expect(basket.addItem).toBeAFunction();
	});

	it("should generate a removeItem method for the removeItem action", function() {
		expect(basket.removeItem).toBeDefined();
		expect(basket.removeItem).toBeAFunction();
	});
});

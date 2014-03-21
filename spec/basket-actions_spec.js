var expect = require('chai').expect;
var api = require('../index');

describe("Basket actions", function() {

	var basket;

	beforeEach(function() {
		basket = new api.Basket();
	});

	it("should generate a create method for the create action", function() {
		expect(basket.create).to.exist;
		expect(basket.create).to.be.a('function');
	});

	it("should generate a get method for the default action", function() {
		expect(basket.get).to.exist;
		expect(basket.get).to.be.a('function');
	});

	it("should generate an addItem method for the addItem action", function() {
		expect(basket.addItem).to.exist;
		expect(basket.addItem).to.be.a('function');
	});

	it("should generate a removeItem method for the removeItem action", function() {
		expect(basket.removeItem).to.exist;
		expect(basket.removeItem).to.be.a('function');
	});
});

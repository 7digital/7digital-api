'use strict';

var assert = require('chai').assert;
var api = require('../index');

describe('Basket actions', function() {

	var basket;

	beforeEach(function() {
		basket = new api.Basket();
	});

	it('generates a create method for the create action', function() {
		assert(basket.create);
		assert.isFunction(basket.create);
	});

	it('generates a get method for the default action', function() {
		assert(basket.get);
		assert.isFunction(basket.get);
	});

	it('generates an addItem method for the addItem action', function() {
		assert(basket.addItem);
		assert.isFunction(basket.addItem);
	});

	it('generates a removeItem method for the removeItem action', function() {
		assert(basket.removeItem);
		assert.isFunction(basket.removeItem);
	});

});

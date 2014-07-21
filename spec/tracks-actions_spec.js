'use strict';

var assert = require('chai').assert;
var api = require('../index');

describe("Tracks actions", function() {

	var tracks;

	beforeEach(function() {
		tracks = new api.Tracks();
	});

	it("should generate a getChart method for the chart action", function() {
		assert(tracks.getChart);
		assert.isFunction(tracks.getChart);
	});

	it("should generate a getDetails method for the details action", function() {
		assert(tracks.getDetails);
		assert.isFunction(tracks.getDetails);
	});

	it("should generate a search method for the search action", function() {
		assert(tracks.search);
		assert.isFunction(tracks.search);
	});
});

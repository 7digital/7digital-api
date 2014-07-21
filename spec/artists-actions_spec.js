'use strict';

var assert = require('chai').assert;
var api = require('../index');

describe("Artists actions", function() {

	var artists;

	beforeEach(function() {
		artists = new api.Artists();
	});

	it("should generate a browse method for the browse action", function() {
		assert(artists.browse);
		assert.isFunction(artists.browse);
	});

	it("should generate a getChart method for the chart action", function() {
		assert(artists.getChart);
		assert.isFunction(artists.getChart);
	});

	it("should generate a getDetails method for the details action", function() {
		assert(artists.getDetails);
		assert.isFunction(artists.getDetails);
	});

	it("should generate a getReleases method for the releases action", function() {
		assert(artists.getReleases);
		assert.isFunction(artists.getReleases);
	});

	it("should generate a search method for the search action", function() {
		assert(artists.search);
		assert.isFunction(artists.search);
	});

	it("should generate a getTopTracks method for the toptracks action", function() {
		assert(artists.getTopTracks);
		assert.isFunction(artists.getTopTracks);
	});

	it("should generate a getTags method for the tags action", function() {
		assert(artists.getTags);
		assert.isFunction(artists.getTags);
	});

	it("should generate a getTopByTags method for the bytag/top action", function() {
		assert(artists.getTopByTags);
		assert.isFunction(artists.getTopByTags);
	});
});

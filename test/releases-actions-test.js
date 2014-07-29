'use strict';

var assert = require('chai').assert;
var api = require('../index');

describe('Releases actions', function() {

	var releases;

	beforeEach(function() {
		releases = new api.Releases();
	});

	it('generates a getByDate method for the byDate action', function() {
		assert(releases.getByDate);
		assert.isFunction(releases.getByDate);
	});

	it('generates a getDetails method for the details action', function() {
		assert(releases.getDetails);
		assert.isFunction(releases.getDetails);
	});

	it('generates a getChart method for the chart action', function() {
		assert(releases.getChart);
		assert.isFunction(releases.getChart);
	});

	it('generates a getRecommendations method for the recommend action',
		function() {

		assert(releases.getRecommendations);
		assert.isFunction(releases.getRecommendations);
	});

	it('generates a search method for the search action', function() {
		assert(releases.search);
		assert.isFunction(releases.search);
	});

	it('generates a getTracks method for the tracks action', function() {
		assert(releases.getTracks);
		assert.isFunction(releases.getTracks);
	});

	it('generates a getTags method for the tags action', function() {
		assert(releases.getTags);
		assert.isFunction(releases.getTags);
	});

	it('generates a getNewByTags method for the bytag/new action', function() {
		assert(releases.getNewByTags);
		assert.isFunction(releases.getNewByTags);
	});

	it('generates a getTopByTags method for the bytag/top action', function() {
		assert(releases.getNewByTags);
		assert.isFunction(releases.getNewByTags);
	});

});

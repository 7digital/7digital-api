var api = require('../index');

require('./custom-matchers.js');

describe("Releases actions", function() {

	var releases;
	
	beforeEach(function() {
		releases = new api.Releases();
	});
	
	it("should generate a getByDate method for the byDate action", function() {
		expect(releases.getByDate).toBeDefined();
		expect(releases.getByDate).toBeAFunction();
	});
		
	it("should generate a getDetails method for the details action", function() {
		expect(releases.getDetails).toBeDefined();
		expect(releases.getDetails).toBeAFunction();
	});
	
	it("should generate a getChart method for the chart action", function() {
		expect(releases.getChart).toBeDefined();
		expect(releases.getChart).toBeAFunction();
	});
	
	it("should generate a getRecommendations method for the recommend action", function() {
		expect(releases.getRecommendations).toBeDefined();
		expect(releases.getRecommendations).toBeAFunction();
	});

	it("should generate a search method for the search action", function() {
		expect(releases.search).toBeDefined();
		expect(releases.search).toBeAFunction();
	});

	it("should generate a getTracks method for the tracks action", function() {
		expect(releases.getTracks).toBeDefined();
		expect(releases.getTracks).toBeAFunction();
	});

	it("should generate a getTags method for the tags action", function() {
		expect(releases.getTags).toBeDefined();
		expect(releases.getTags).toBeAFunction();
	});

	it("should generate a getNewByTags method for the bytag/new action", function() {
		expect(releases.getNewByTags).toBeDefined();
		expect(releases.getNewByTags).toBeAFunction();
	});

	it("should generate a getTopByTags method for the bytag/top action", function() {
		expect(releases.getNewByTags).toBeDefined();
		expect(releases.getNewByTags).toBeAFunction();
	});
});

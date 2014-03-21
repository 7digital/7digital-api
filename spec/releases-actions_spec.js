var expect = require('chai').expect;
var api = require('../index');

describe("Releases actions", function() {

	var releases;

	beforeEach(function() {
		releases = new api.Releases();
	});

	it("should generate a getByDate method for the byDate action", function() {
		expect(releases.getByDate).to.exist;
		expect(releases.getByDate).to.be.a('function');
	});

	it("should generate a getDetails method for the details action", function() {
		expect(releases.getDetails).to.exist;
		expect(releases.getDetails).to.be.a('function');
	});

	it("should generate a getChart method for the chart action", function() {
		expect(releases.getChart).to.exist;
		expect(releases.getChart).to.be.a('function');
	});

	it("should generate a getRecommendations method for the recommend action", function() {
		expect(releases.getRecommendations).to.exist;
		expect(releases.getRecommendations).to.be.a('function');
	});

	it("should generate a search method for the search action", function() {
		expect(releases.search).to.exist;
		expect(releases.search).to.be.a('function');
	});

	it("should generate a getTracks method for the tracks action", function() {
		expect(releases.getTracks).to.exist;
		expect(releases.getTracks).to.be.a('function');
	});

	it("should generate a getTags method for the tags action", function() {
		expect(releases.getTags).to.exist;
		expect(releases.getTags).to.be.a('function');
	});

	it("should generate a getNewByTags method for the bytag/new action", function() {
		expect(releases.getNewByTags).to.exist;
		expect(releases.getNewByTags).to.be.a('function');
	});

	it("should generate a getTopByTags method for the bytag/top action", function() {
		expect(releases.getNewByTags).to.exist;
		expect(releases.getNewByTags).to.be.a('function');
	});
});

var expect = require('chai').expect;
var api = require('../index');

describe("Artists actions", function() {

	var artists;

	beforeEach(function() {
		artists = new api.Artists();
	});

	it("should generate a browse method for the browse action", function() {
		expect(artists.browse).to.exist;
		expect(artists.browse).to.exist;
	});

	it("should generate a getChart method for the chart action", function() {
		expect(artists.getChart).to.exist;
		expect(artists.getChart).to.be.a('function');
	});

	it("should generate a getDetails method for the details action", function() {
		expect(artists.getDetails).to.exist;
		expect(artists.getDetails).to.be.a('function');
	});

	it("should generate a getReleases method for the releases action", function() {
		expect(artists.getReleases).to.exist;
		expect(artists.getReleases).to.be.a('function');
	});

	it("should generate a search method for the search action", function() {
		expect(artists.search).to.exist;
		expect(artists.search).to.be.a('function');
	});

	it("should generate a getTopTracks method for the toptracks action", function() {
		expect(artists.getTopTracks).to.exist;
		expect(artists.getTopTracks).to.be.a('function');
	});

	it("should generate a getTags method for the tags action", function() {
		expect(artists.getTags).to.exist;
		expect(artists.getTags).to.be.a('function');
	});

	it("should generate a getTopByTags method for the bytag/top action", function() {
		expect(artists.getTopByTags).to.exist;
		expect(artists.getTopByTags).to.be.a('function');
	});
});

var api = require('../../../../lib/api').Api.buildFromFile(__dirname + '/../../../../lib/api.json');
require('../../../helpers/Matchers.js');

describe("Artists actions", function() {

	var artists;
	
	beforeEach(function() {
		artists = new api.Artists();
	});
	
	it("should generate a browse method for the browse action", function() {
		expect(artists.browse).toBeDefined();
    expect(artists.browse).toBeDefined();
	});
		
	it("should generate a getChart method for the chart action", function() {
		expect(artists.getChart).toBeDefined();
		expect(artists.getChart).toBeAFunction();
	});

	it("should generate a getDetails method for the details action", function() {
		expect(artists.getDetails).toBeDefined();
		expect(artists.getDetails).toBeAFunction();
	});

	it("should generate a getReleases method for the releases action", function() {
		expect(artists.getReleases).toBeDefined();
		expect(artists.getReleases).toBeAFunction();
	});

	it("should generate a search method for the search action", function() {
		expect(artists.search).toBeDefined();
		expect(artists.search).toBeAFunction();
	});

	it("should generate a getTopTracks method for the toptracks action", function() {
		expect(artists.getTopTracks).toBeDefined();
		expect(artists.getTopTracks).toBeAFunction();
	});

	it("should generate a getTags method for the tags action", function() {
		expect(artists.getTags).toBeDefined();
		expect(artists.getTags).toBeAFunction();
	});

	it("should generate a getTopByTags method for the bytag/top action", function() {
		expect(artists.getTopByTags).toBeDefined();
		expect(artists.getTopByTags).toBeAFunction();
	});
});

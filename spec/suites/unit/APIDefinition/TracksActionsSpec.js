var api = require('../../../../lib/api').Api.buildFromFile(__dirname + '/../../../../lib/api.json');

describe("Tracks actions", function() {

	var releases;
	
	beforeEach(function() {
		tracks = new api.Tracks();
	});
	
	it("should generate a getChart method for the chart action", function() {
		expect(tracks.getChart).toBeDefined();
		expect(tracks.getChart).toBeAFunction();
	});
		
	it("should generate a getDetails method for the details action", function() {
		expect(tracks.getDetails).toBeDefined();
		expect(tracks.getDetails).toBeAFunction();
	});

	it("should generate a getPreview method for the preview action", function() {
		expect(tracks.getPreview).toBeDefined();
		expect(tracks.getPreview).toBeAFunction();
	});

	it("should generate a search method for the search action", function() {
		expect(tracks.search).toBeDefined();
		expect(tracks.search).toBeAFunction();
	});
});

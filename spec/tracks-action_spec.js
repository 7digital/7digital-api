var expect = require('chai').expect;
var api = require('../index');

describe("Tracks actions", function() {

	var releases;
	
	beforeEach(function() {
		tracks = new api.Tracks();
	});
	
	it("should generate a getChart method for the chart action", function() {
		expect(tracks.getChart).to.exist;
		expect(tracks.getChart).to.be.a('function');
	});
		
	it("should generate a getDetails method for the details action", function() {
		expect(tracks.getDetails).to.exist;
		expect(tracks.getDetails).to.be.a('function');
	});

	it("should generate a getPreview method for the preview action", function() {
		expect(tracks.getPreview).to.exist;
		expect(tracks.getPreview).to.be.a('function');
	});

	it("should generate a search method for the search action", function() {
		expect(tracks.search).to.exist;
		expect(tracks.search).to.be.a('function');
	});
});

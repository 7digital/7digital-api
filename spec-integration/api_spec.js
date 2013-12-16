var fs = require('fs');
var config = require('../config');

var schemaText = fs.readFileSync(config.schemapath);
var schema = JSON.parse(schemaText.toString());

schema.host = 'localhost';
schema.port = '3000'
schema.version = undefined;

var Api = require('../lib/api').Api;

var api = new Api({
	schema: schema,
	format: 'json',
	logger: require('../lib/logger')
});

var expect = require('chai').expect;

describe('api', function () {

	it('should get a release by id', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 1192901 }, function (err, data) {
			expect(data.release.title).to.equal('Wasting Light');
			done();
		});
	});

	it('should handle bad xml from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'error' }, function (err, data) {
			//Currently dies because xml2js never calls back..
			//https://github.com/Leonidas-from-XIV/node-xml2js/issues/51
			expect(err).to.not.equal(undefined);
			done();
		});
	});
});

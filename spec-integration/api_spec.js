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
});

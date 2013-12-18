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
	var childProcess = require('child_process');
	var serverProcess;
	var processStarted;

	before(function (done) {
		var nodeProcessPath;
		try {
			nodeProcessPath = require.resolve('api-stub');
			console.log('spawning node api-stub process : ', nodeProcessPath, '\n');

			serverProcess = childProcess.spawn('node', [nodeProcessPath], {});

			serverProcess.stdout.on('data', function (data) {
				if (!processStarted) {
					processStarted = true;
					done();
				}
			});

			serverProcess.stderr.on('data', function (data) {
				console.log('' + data);
			});
		} catch (e) {
			console.log('Make sure api-stub module is installed!');
		}
	});

	after(function () {
		console.log('\nshutting down api-stub process');
		serverProcess.kill('SIGKILL');
	});

	it('should get a release by id', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 1192901 }, function (err, data) {
			expect(data.release.title).to.equal('Wasting Light');
			done();
		});
	});

	xit('should handle bad xml from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'error' }, function (err, data) {
			//Currently dies because xml2js never calls back..
			//https://github.com/Leonidas-from-XIV/node-xml2js/issues/51
			expect(err).to.be.ok;
			done();
		});
	});

	it('should handle missing resources from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'missing' }, function (err, data) {
			expect(err).to.be.ok;
			expect(err.code).to.equal('2001');
			done();
		});
	});

	it('should handle unexpected but valid xml from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'strangeResponse' }, function (err, data) {
			expect(err).to.be.ok;
			expect(err.message).to.equal('unexpected response returned by api');
			done();
		});
	});

	it('should handle unrecognised statuses from the api', function (done) {
		var releases = new api.Releases();
		releases.getDetails({ releaseId: 'unrecognisedStatus' }, function (err, data) {
			expect(err).to.be.ok;
			expect(err.message).to.match(/^unrecognised response status/);
			done();
		});
	});
});

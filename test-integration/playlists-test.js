var consumerkey = process.env.NODE_API_CLIENT_TESTS_CONSUMER_KEY;
var consumersecret = process.env.NODE_API_CLIENT_TESTS_CONSUMER_SECRET;
var api = require('../index').configure({
	consumerkey: consumerkey,
	consumersecret: consumersecret,
	defaultParams: {
		// If your key is locked to a country you must add it here:
		//country: 'us'
	}
});
var assert = require('chai').assert;
var uuid = require('node-uuid');
var async = require('async');
var oauth = new api.OAuth();
var userId, requestToken, requestSecret;

function stringify(obj) {
	return JSON.stringify(obj, null, '  ');
}
describe('Playlist api', function () {

	this.timeout(40000);
	it('can create a playlist and read it back', function (done) {
		var playlists = new api.Playlists();
		var name = 'badman bangers';
		var visibility = 'Public';
		var userPublic = new api.User();
		var username = 'node-client-test-' + uuid.v4() + '@7digital.com';
		var password = 'Password1';

		async.waterfall([
			function createUser(cb) {
				console.log('Creating user');
				userPublic.signup({
					emailAddress: username,
					password: password,
				}, cb);
			},
			function getRequestToken(userResponse, cb) {
				console.info('Created user ' + username);
				console.info(userResponse);

				userId = userResponse.user.id;

				// Get a request token using the oauth helper
				oauth.getRequestToken('http://callbackurl.com/', function (reqTok, recSec, authUrl, err) {
					console.log(err);
					cb(reqTok, recSec, authUrl, err);
				});
			},
			function authorise(reqTok, reqSec, authUrl, cb) {
				// Log the request token and secret
				console.info('Received Request Token and Secret');
				console.info('Request Token: %s', reqTok);
				console.info('Request Secret: %s', reqSec);

				requestToken = reqTok;
				requestSecret = reqSec;

				// NOTE: this simulates the step where the user is sent to
				// account.7digital.com to authorise the 3-legged access
				oauth.authoriseRequestToken({
					username: username,
					password: password,
					token: requestToken
				}, cb);
			},
			function continueAfterAuthorisation(cb) {
				// Get an access token using the oauth helper using the authorised
				// request token and secret
				oauth.getAccessToken({
					requesttoken: requestToken,
					requestsecret: requestSecret
				}, cb);
			},
			function createAPlaylist(accessToken, accessSecret, cb) {
				console.info('Creating Playlists');

				playlists.create({
					accesstoken: accessToken,
					accesssecret: accessSecret,
					name: name,
					visibility: visibility,
					tracks: [{
						trackId: '31032383',
						trackTitle: 'Valley of the shadows',
						trackVersion: 'Origin Unknown',
						artistAppearsAs: 'Origin Unknown',
						releaseId: '2908039',
						releaseTitle: 'Valley of the shadows',
						releaseAritistAppearsAs: 'Valley of the shadows',
						releaseVersion: 'Original Version',
						source: '7digital'
					}]
				}, function (err, res) {
					console.log('PLAYLIST', stringify(res));
					cb(err, accessToken, accessSecret);
				});
			},
			function getPlaylists(accessToken, accessSecret, cb) {
				playlists.get({
					user: 'id:' + userId,
					accesstoken: accessToken,
					accesssecret: accessSecret
				},
				function assertOnFinalPlaylists(err, playlistRes) {
					if (err) {
						cb(err);
					}
					console.log('Got playlists', stringify(playlistRes));
					var userPlaylists = playlistRes.playlists, actualPlaylist;
					assert.ok(userPlaylists);
					actualPlaylist = userPlaylists.playlist;
					assert.ok(actualPlaylist);
					assert.equal(actualPlaylist.name, name);
					assert.equal(actualPlaylist.visibility, visibility);
					assert.equal(actualPlaylist.trackCount, 1);
					assert.isDefined(actualPlaylist.id);
					cb(null);
				});
			}
		],
		function (err) {
			if (err) {
				console.error('An error occurred:');
				console.error(stringify(err));
			}
			done(err);
		});
	});
});

// Module dependencies
var async = require('async');
var util = require('util');
var uuid = require('node-uuid');
// Consumer key and secret
// Replace these with your key
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
var oauth = new api.OAuth();
var user = new api.User();
var username, password, requestToken, requestSecret;

async.waterfall([
	function createUser(cb) {
		username = 'node-client-test-' + uuid.v4() + '@7digital.com';
		password = 'top-secret';
		user.signup({
			emailAddress: username,
			password: password
		}, cb);
	},
	function getRequestToken(userResponse, cb) {
		console.info('Created user ' + username);
		console.info(userResponse);

		// Get a request token using the oauth helper
		oauth.getRequestToken('http://callbackurl.com/', cb);
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
	function logTheAccessToken(accessToken, accessSecret, cb) {
		// Log the access token and secret
		console.info('Received Access Token and Secret');
		console.info('Access Token: %s', accessToken);
		console.info('Access Secret: %s', accessSecret);

		user.getLocker({
			accesstoken: accessToken,
			accesssecret: accessSecret,
			pageSize: 1
		}, cb);
	},
	function showLocker(lockerResponse, cb) {
		console.log('Successfully accessed the user\'s locker: ');
		console.log(util.inspect(lockerResponse, { depth: null, colors: true }));

		cb();
	}
], function (err) {
	if (err) {
		console.error('An error occurred:');
		console.error(util.inspect(err.stack, { depth: null, colors: true }));
		return process.exit(1);
	}
	process.exit(0);
});

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
var username = 'node-client-test-' + uuid.v4() + '@7digital.com';
var password = 'top-secret';
var requestToken, requestSecret, userId;

function stringify(obj) {
	return JSON.stringify(obj, null, '  ');
}

async.waterfall([
	function createUser(cb) {
		user.signup({
			emailAddress: username,
			password: password
		}, cb);
	},
	function authenticateUser(res, cb) {
		console.log('Successfully created user');
		user.authenticate({
			emailAddress: username,
			password: password
		}, cb);
	},
	function validateAuthentication(res, cb) {
		if (res.user.emailAddress !== username) {
			return cb(new Error('Authenticated response email didn\'t match'));
		}
		console.log('Successfully authenticated user');
		console.log(stringify(res));
		cb();
	}
], function (err) {
	if (err) {
		console.error('An error occurred:');
		console.error(stringify(err));
		return process.exit(1);
	}
	process.exit(0);
});

var OAuth = require('../support/oauth/index').OAuth,
	xml2js = require('../vendor/node-xml2js/lib/xml2js'),
	Step = require('step'),
	eyes = require('eyes'),
	config = require('../config').Config,
	oAuth = new OAuth('http://api.7digital.com/1.2/oauth/requesttoken',
		'http://api.7digital.com/1.2/oauth/accesstoken',
		config.oauthkey,
		config.oauthsecret,
		'1.0',
		null,
		'HMAC-SHA1');

Step(
	function getRequestToken() {
		console.log('Requesting a request token');
		oAuth.getOAuthRequestToken('GET', this);
	},
	function parseResponse(error, oauth_token, oauth_token_secret, results) {
		var mangledResponse = results['<?xml version'],
			requestToken, requestSecret;

		if (error) {
			console.log('Error calling API for request token: %j', error);
			throw error;
		} else {
			requestToken = /\<oauth_token\>([^<]*)\<\/oauth_token\>/.exec(mangledResponse)[1];
			requestSecret  = /\<oauth_token_secret\>([^<]*)\<\/oauth_token_secret\>/.exec(mangledResponse)[1];
			console.log('Request token: %s', requestToken);
			console.log('Request secret: %s', requestSecret);

			oAuth.getOAuthAccessToken(requestToken, requestSecret, this);
		}
	},
	function parseResponse(error, oauth_access_token, oauth_access_token_secret, results2) {
		if (error) {
			console.log('error : %j', error);
			throw error;
		} else {
			console.log('requestoken results :' + console.dir(results));
		}
	}
);

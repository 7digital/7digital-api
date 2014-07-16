'use strict';

var qs = require('querystring');
var OAuth = require('oauth').OAuth;
var accessTokenUrl = 'http://api.7digital.com/1.2/oauth/accesstoken';
var responseParser = require('./responseparser');

// Creates an OAuth v1 wrapper configured with the supplied key and
// secret and the necessary options for authenticating with the
// 7digital API.
//
// - @param {String} oauthkey
// - @param {String} oauthsecret
//
// - @return {OAuth}
function createOAuthWrapper(oauthkey,
	oauthsecret) {

	return new OAuth(
				'http://api.7digital.com/1.2/oauth/requesttoken',
				accessTokenUrl,
				oauthkey, oauthsecret, '1.0', null, 'HMAC-SHA1');
}

// Gets a request token from the 7digital API and generates an authorise
// url for the user to grant the application access to their locker and
// make purchases on their behalf.
//
//
//     var oauthHelper = require('oauth-helper');
//     oauthHelper.getRequestToken({
//             oauthkey: 'YOUR_KEY_HERE',
//             oauthsecret: 'YOUR_SECRET',
//             callbackUrl: ''
//         }, function authorise(err, requestToken, requestSecret,
//                               authoriseUrl) {
//              // Get an access token
//     });
//
//
// The options parameter should contain the following
//
//  - `oauthkey` your app's oauth consumer key
//  - `oauthsecret` your app's oauth consumer secret
//  - `country` if your key is restricted to a country, you need to supply the
//  country here or you will receive a 401 OAuth authentication error.
//  - `callbackUrl` (optional) the url to return once the user has authorised
//                  your app
//
// - @param {Object} options
// - @param {Function} callback
function getRequestToken(options, callback) {
	var oAuth = createOAuthWrapper(options.oauthkey, options.oauthsecret);

	if (options.country) {
		oAuth.getOAuthRequestToken({ country: options.country },
			buildAuthoriseUrl);
	} else {
		oAuth.getOAuthRequestToken(buildAuthoriseUrl);
	}
	function buildAuthoriseUrl(err, requestToken, requestSecret, results) {
		var authoriseUrl;

		if (err) {
			callback(err);
			return;
		}

		authoriseUrl = 'https://account.7digital.com/' +
						options.oauthkey + '/oauth/authorise?' +
					'oauth_token=' + requestToken + '&oauth_callback=' +
					encodeURIComponent(options.callbackUrl);

		return callback(null, requestToken, requestSecret, authoriseUrl);
	}
}

function createTokenResponseChecker(callback) {
	return function checkResponse(err, data) {
		if (err) {
			return callback(err);
		}

		responseParser.parse(data,
			{ format: 'js', logger: require('./logger') }, getTokens);
		function getTokens(err, tokenResponse) {
			var accessToken, accessSecret;

			if (err) {
				return callback(err);
			}

			callback(null, tokenResponse);
		}
	};
}

// Authorises a request token from the 7digital API for consumers who have
// access to the user management API.  If there is no error the requesttoken
// may be used to gain an access token using `getAccessToken`.
//
//
// The options parameter should contain the following
//
//  - `oauthkey` your app's oauth consumer key
//  - `oauthsecret` your app's oauth consumer secret
//  - `country` if your key is restricted to a country, you need to supply the
//  country here or you will receive a 401 OAuth authentication error.
//  - `username` the email address of the user
//  - `password` the password for the user's account
//  - `requesttoken` the request token received from `getRequestToken`
function authoriseRequestToken(options, callback) {
	var url = 'https://api.7digital.com/1.2/oauth/requestToken/authorise?',
		requestData = {
		username: options.username,
		password: options.password,
		token: options.requesttoken
	}, client = createOAuthWrapper(options.oauthkey, options.oauthsecret),
	fullUrl;

	if (options.country) {
		requestData.country = options.country;
	}

	fullUrl = url + qs.stringify(requestData);

	return client.get(fullUrl, null, null, checkResponse);
	function checkResponse(err, data) {
		if (err) {
			return callback(err);
		}

		responseParser.parse(data,
			{ format: 'js', logger: require('./logger') }, getTokens);
		function getTokens(err, tokenResponse) {
			var accessToken, accessSecret;

			if (err) {
				return callback(err);
			}

			return callback();
		}
	}
}

// Gets an access token from the 7digital API for signing requests to
// access a user's 7digital account on their behalf.
//
// You must generate your access token only after the user has authorised
// the request token.
//
// You can use this token and secret for signing requests to the 3-legged
// OAuth secured API endpoints.
//
//
//     var oauthHelper = require('oauth-helper');
//     oauthHelper.getAccessToken({
//             oauthkey: 'YOUR_KEY_HERE',
//             oauthsecret: 'YOUR_SECRET_HERE',
//             requesttoken: 'YOUR_TOKEN_HERE',
//             requestsecret: 'TOKEN_SECRET_HERE'
//         }, function accessSignedEndpoints(err, accessToken, accessSecret) {
//             // Access the user's locker etc
//     });
//
//
// The options parameter should contain the following
//
//  - `requesttoken` an authorised OAuth request token
//  - `requestsecret` the corresponding OAuth request secret
//  - `country` if your key is restricted to a country, you need to supply the
//  country here or you will receive a 401 OAuth authentication error.
//
// - @param {Object} options
// - @param {Function} callback
function getAccessToken(options, callback) {
	var wrapperFactory = createOAuthWrapper;
	var oAuth = wrapperFactory(options.oauthkey, options.oauthsecret);
	var extraParams = {};

	if (options.country) {
		extraParams.country = options.country;
	}

	// This must be done manually rather than using the wrapper as there is
	// no means of supplying the extra parameter via getOAuthAccessToken
	oAuth._performSecureRequest(options.requesttoken, options.requestsecret,
		'GET', accessTokenUrl, extraParams, null, null, checkResponse);
	function checkResponse(err, data) {
		if (err) {
			return callback(err);
		}

		responseParser.parse(data,
			{ format: 'js', logger: require('./logger') }, getTokens);
		function getTokens(err, tokenResponse) {
			var accessToken, accessSecret;

			if (err) {
				return callback(err);
			}

			accessToken = tokenResponse.oauth_access_token.oauth_token;
			accessSecret = tokenResponse.oauth_access_token.oauth_token_secret;

			return callback(null, accessToken, accessSecret);
		}
   }
}

module.exports = exports = {
	createOAuthWrapper: createOAuthWrapper,
	getRequestToken: getRequestToken,
	authoriseRequestToken: authoriseRequestToken,
	getAccessToken: getAccessToken
};

var OAuth = require('oauth').OAuth,
	step = require('step'),
	readline = require('readline'),
	createOAuthWrapper,
	// Regular expressions for parsing the XML OAuth response
	tokenPattern = /<oauth_token\>([^<]*)<\/oauth_token\>/,
	secretPattern = /<oauth_token_secret\>([^<]*)<\/oauth_token_secret\>/;

// Creates an OAuth v1 wrapper configured with the supplied key and
// secret and the necessary options for authenticating with the
// 7digital API.
//
// - @param {String} oauthkey
// - @param {String} oauthsecret
//
// - @return {OAuth}
module.exports.createOAuthWrapper = createOAuthWrapper =
	function (oauthkey, oauthsecret) {
	var oAuth = new OAuth(
				'http://api.7digital.com/1.2/oauth/requesttoken',
				'http://api.7digital.com/1.2/oauth/accesstoken',
				oauthkey, oauthsecret, '1.0', null, 'HMAC-SHA1');

	oAuth.setClientOptions({
		requestTokenHttpMethod: "GET",
		accessTokenHttpMethod: "GET"
	});

	return oAuth;
};

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
//  - `callbackUrl` (optional) the url to return once the user has authorised
//                  your app
//
// - @param {Object} options
// - @param {Function} callback
module.exports.getRequestToken = function (options, callback) {
	var wrapperFactory = createOAuthWrapper;

	step(
		function getRequestToken() {
			var oAuth = wrapperFactory(options.oauthkey, options.oauthsecret);

			oAuth.getOAuthRequestToken(this);
		},
		function parseResponse(err, oauth_token, oauth_token_secret, results) {
			var mangledResponse, requestToken, requestSecret, authoriseUrl,
				returnUrl, consoleInterface;

			if (err) {
				callback(err);
				return;
			}

			// The OAuth endpoints on the 7digital API return XML instead of
			// an encoded parameter response.
			mangledResponse = results['<?xml version'];

			// Parse the token and secret from the XML
			requestToken = tokenPattern.exec(mangledResponse)[1];
			requestSecret  = secretPattern.exec(mangledResponse)[1];

			// re-encode the token and secret as the node oauth client
			// decodes them thinking they are parameter encoded as per
			// the spec.
			requestToken = requestToken.replace(' ', '+');
			requestSecret = requestSecret.replace(' ', '+');

			authoriseUrl = 'https://account.7digital.com/' +
							options.oauthkey + '/oauth/authorise?' +
						'oauth_token=' + requestToken + '&oauth_callback=' +
						encodeURIComponent(options.callbackUrl);

			callback(null, requestToken, requestSecret, authoriseUrl);
		}
	);
};

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
//         }, function accessSignedEndpoints(err, accesstoken, accesssecret) {
//             // Access the user's locker etc
//     });
//
//
// The options parameter should contain the following
//
//  - `requesttoken` an authorised OAuth request token
//  - `requestsecret` the corresponding OAuth request secret
//
// - @param {Object} options
// - @param {Function} callback
module.exports.getAccessToken = function getAccessToken(options, callback) {
	var wrapperFactory = createOAuthWrapper;

	step(
		function getAccessToken() {
			var oAuth = wrapperFactory(options.oauthkey, options.oauthsecret);

			oAuth.getOAuthAccessToken(options.requesttoken,
										options.requestsecret, this);
		},
		function parseResponse(err, oauth_access_token,
								oauth_access_token_secret, results) {
			var mangledResponse, accessToken, accessSecret;

			if (err) {
				callback(err);
				return;
			}

			// The OAuth endpoints on the 7digital API return XML instead of
			// an encoded parameter response.
			mangledResponse = results['<?xml version'];

			// The OAuth endpoints on the 7digital API return XML instead of an
			// encoded parameter response so we need to parse the token and
			// secret from the XML
			accessToken = tokenPattern.exec(mangledResponse)[1];
			accessSecret = secretPattern.exec(mangledResponse)[1];

			// Parse the token and secret from the XML
			accessToken = accessToken.replace(' ', '+');
			accessSecret = accessSecret.replace(' ', '+');

			callback(null, accessToken, accessSecret);
		}
	);
};

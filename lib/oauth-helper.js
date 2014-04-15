var OAuth = require('oauth').OAuth;

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
				'http://api.7digital.com/1.2/oauth/accesstoken',
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
//  - `callbackUrl` (optional) the url to return once the user has authorised
//                  your app
//
// - @param {Object} options
// - @param {Function} callback
function getRequestToken(options, callback) {
	var oAuth = createOAuthWrapper(options.oauthkey, options.oauthsecret);

	oAuth.getOAuthRequestToken(buildAuthoriseUrl);
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
function getAccessToken(options, callback) {
	var wrapperFactory = createOAuthWrapper;
	var oAuth = wrapperFactory(options.oauthkey, options.oauthsecret);

	oAuth.getOAuthAccessToken(options.requesttoken,
								options.requestsecret, callback);
}

module.exports = exports = {
	createOAuthWrapper: createOAuthWrapper,
	getRequestToken: getRequestToken,
	getAccessToken: getAccessToken
};

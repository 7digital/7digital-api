'use strict';

var qs = require('querystring');
var OAuthClient = require('oauth').OAuth;
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
	oauthsecret, headers) {

	return new OAuthClient(
				'http://api.7digital.com/1.2/oauth/requesttoken',
				accessTokenUrl,
				oauthkey, oauthsecret, '1.0', null, 'HMAC-SHA1', 32, headers);
}

function OAuth(options) {
	this.consumerkey = options.consumerkey;
	this.consumersecret = options.consumersecret;
	this.client = createOAuthWrapper(options.consumerkey,
		options.consumersecret);
}

// Gets a request token from the 7digital API and generates an authorise
// url for the user to grant the application access to their locker and
// make purchases on their behalf.
//
//
//     var api = require('7digital-api').configure({
//             consumerkey: 'YOUR_KEY_HERE',
//             consumersecret: 'YOUR_SECRET',
//             defaultParams: {
//                  country: 'fr'
//             }
//     });
//     var oAuth = new api.OAuth();
//     oAuth.getRequestToken('http://acme.com/oauth_cb', authorise);
//     function authorise(err, requestToken, requestSecret, authoriseUrl) {
//              // Get an access token
//     });
//
// - @param {String} cbUrl
// - @param {Function} callback
OAuth.prototype.getRequestToken = function getRequestToken(cbUrl, callback) {
	if (this.defaultParams.country) {
		this.client.getOAuthRequestToken({
			country: this.defaultParams.country
		}, buildAuthoriseUrl.bind(this));
	} else {
		this.client.getOAuthRequestToken(buildAuthoriseUrl.bind(this));
	}
	function buildAuthoriseUrl(err, requestToken, requestSecret, results) {
		var authoriseUrl;

		if (err) {
			callback(err);
			return;
		}

		/* jshint validthis: true */
		authoriseUrl = 'https://account.7digital.com/' +
						this.consumerkey + '/oauth/authorise?' +
					'oauth_token=' + requestToken + '&oauth_callback=' +
					encodeURIComponent(cbUrl);

		return callback(null, requestToken, requestSecret, authoriseUrl);
	}
};

// Authorises a request token from the 7digital API for consumers who have
// access to the user management API.  If there is no error the requesttoken
// may be used to gain an access token using `getAccessToken`.
//
//
// The requestData parameter should contain the following
//
//  - `username` the email address of the user
//  - `password` the password for the user's account
//  - `token` the request token received from `getRequestToken`
//
// - @param {Object} requestData
// - @param {Function} callback
OAuth.prototype.authoriseRequestToken = function authoriseRequestToken(
	requestData, callback) {

	var url = 'https://api.7digital.com/1.2/oauth/requestToken/authorise?';
	var fullUrl;

	if (this.country) {
		requestData.country = this.defaultParams.country;
	}

	fullUrl = url + qs.stringify(requestData);

	return this.client.get(fullUrl, null, null, checkResponse.bind(this));
	/* jshint validthis: true */
	function checkResponse(err, data) {
		if (err) {
			return callback(err);
		}

		responseParser.parse(data,
			{ format: this.format, logger: this.logger }, getTokens);
		function getTokens(err, tokenResponse) {
			var accessToken, accessSecret;

			if (err) {
				return callback(err);
			}

			return callback();
		}
	}
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
//     var api = require('7digital-api').configure({
//             consumerkey: 'YOUR_KEY_HERE',
//             consumersecret: 'YOUR_SECRET',
//             defaultParams: {
//                 country: 'us'
//             }
//     });
//     var oAuth = new api.OAuth();
//     oAuth.getAccessToken({
//             requesttoken: 'YOUR_TOKEN_HERE',
//             requestsecret: 'TOKEN_SECRET_HERE'
//         }, function accessSignedEndpoints(err, accessToken, accessSecret) {
//             // Access the user's locker etc
//     });
//
//
// The requestData parameter should contain the following
//
//  - `requesttoken` an authorised OAuth request token
//  - `requestsecret` the corresponding OAuth request secret
//
// - @param {Object} requestData
// - @param {Function} callback
OAuth.prototype.getAccessToken = function getAccessToken(requestData,
	callback) {

	var extraParams = null;

	if (this.defaultParams.country) {
		extraParams = { country: this.defaultParams.country };
	}

	// This must be done manually rather than using the wrapper as there is
	// no means of supplying the extra parameter via getOAuthAccessToken
	this.client._performSecureRequest(requestData.requesttoken,
		requestData.requestsecret, 'POST', accessTokenUrl, extraParams, null,
		null, checkResponse.bind(this));
	/* jshint validthis: true */
	function checkResponse(err, data, response) {
		var results, accessToken, accessSecret;

		if (err) {
			return callback(err);
		}

		// Check if we got a for url encoded response
		if (/oauth_token/.test(data)) {
			results = require('querystring').parse(data);
			accessToken= results['oauth_token'];
			accessSecret = results['oauth_token_secret'];

			delete results['oauth_token'];
			delete results['oauth_token_secret'];

			return callback(null, accessToken, accessSecret);
		}

		// We didn't so parse the body as an XML response
		responseParser.parse(data,
			{ format: this.format, logger: this.logger }, getTokens);
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
};

// Allows you to sign 2-legged GET requests manually.  The common case for this
// is to sign preview clip requests which are on a different host from the rest
// of the API.
//
//  - @param {String} `url` The url to sign
//  - @param {Object} `parameters` Any extra parameters.
OAuth.prototype.sign = function sign(url, parameters) {
	var orderedParams;
	var params = {};
	var query = '';
	var parsedUrl= require('url').parse( url, false );

	if (this.defaultParams.country) {
		params.country = this.defaultParams.country;
	}

	if (parameters && parameters.country) {
		params.country = parameters.country;
	}

	orderedParams = this.client._prepareParameters(null, null,
		'GET', url, params);

	for( var i= 0 ; i < orderedParams.length; i++) {
		query+= orderedParams[i][0] + '=' +
			this.client._encodeData(orderedParams[i][1]) + '&';
	}
	query= query.substring(0, query.length-1);

	return parsedUrl.protocol + '//'+ parsedUrl.host + parsedUrl.pathname +
		'?' + query;
};

module.exports = exports = {
	createOAuthWrapper: createOAuthWrapper,
	OAuth: OAuth
};

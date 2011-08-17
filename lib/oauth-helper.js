var
	/**
	 * Module dependencies
	 */
	OAuth = require('oauth').OAuth,
	Step = require('step'),
	readline = require('readline'),
	/**
	 * Regular expressions for parsing the XML oauth response
	 */
	tokenPattern = /\<oauth_token\>([^\<]*)\<\/oauth_token\>/,
	secretPattern = /\<oauth_token_secret\>([^\<]*)\<\/oauth_token_secret\>/;

/**
 * Creates an OAuth v1 wrapper configured with the supplied key and
 * secret and the necessary options for authenticating with the
 * 7digital API.
 *
 * @param {String} oauthkey
 * @param {String} oauthsecret
 *
 * @return {OAuth}
 */
function createOAuthWrapper(oauthkey, oauthsecret) {
		/*
		 * Create an OAuthv1 wrapper object with the provided
		 * consumer key and the 7digital OAuth URLs.
		 */
		oAuth = new OAuth(
					'http://api.7digital.com/1.2/oauth/requesttoken',
					'http://api.7digital.com/1.2/oauth/accesstoken',
					oauthkey, oauthsecret, '1.0', null, 'HMAC-SHA1');

		/**
		 * Configures the oauth library to make GET requests to the oauth
		 * endpoints.
		 */
		oAuth.setClientOptions({
			requestTokenHttpMethod: "GET",
			accessTokenHttpMethod: "GET"
		});

		return oAuth;
 }

/*
 * Gets a request token from the 7digital API and generates an authorise
 * url for the user to grant the application access to their locker and
 * make purchases on their behalf.
 *
 *
 * var oauthHelper = require('oauth-helper');
 * oauthHelper.getRequestToken({ 
 *         oauthkey: 'YOUR_KEY_HERE',
 *         oauthsecret: 'YOUR_SECRET',
 *         callbackUrl: ''
 *     }, function authorise(err, requestToken, requestSecret, authoriseUrl)  {
 *          // Get an access token
 * });
 *
 * The options parameter should contain the following
 *  - `oauthkey` your app's oauth consumer key
 *  - `oauthsecret` your app's oauth consumer secret
 *  - `callbackUrl` (optional) the url to return once the user has authorised your app
 *
 * @param {Object} options
 * @param {Function} callback
 */
exports.getRequestToken = function(options, callback) {
	/*
	 * Cache a reference to the wrapper factory so it is
	 * captured in the step closures.
	 */
	 var wrapperFactory = createOAuthWrapper;

	/**
	 * Generating your access token after the user has authorised the request token. You
	 * will use this token for signing requests to the 3-legged OAuth secured API endpoints.
	 */
	Step(
		function getRequestToken() {
			/*
			 * Create an OAuthv1 wrapper
			 */
			oAuth = wrapperFactory(options.oauthkey, options.oauthsecret);

			/*
			 * Configures the oauth library to make GET requests to the oauth
			 * endpoints.
			 */
			oAuth.setClientOptions({
				requestTokenHttpMethod: "GET",
				accessTokenHttpMethod: "GET"
			});

			/**
			 * Request the token using the oauth wrapper
			 */
			oAuth.getOAuthRequestToken(this);
		},
		function parseResponse(err, oauth_token, oauth_token_secret, results) {
			var mangledResponse, requestToken, requestSecret, authoriseUrl, 
				returnUrl, consoleInterface;

			/**
			 * Pass control back to the caller to let them know an error
			 * occurred if there is one.
			 */
			if (err) {
				callback(err);
				return;
			}

			/**
			 * The OAuth endpoints on the 7digital API return XML instead of an encoded
			 * parameter response.
			 */
			mangledResponse = results['<?xml version'];

			/**
			 * Parse the token and secret from the XML
			 */
			requestToken = tokenPattern.exec(mangledResponse)[1];
			requestSecret  = secretPattern.exec(mangledResponse)[1];

			/**
			 * If you are integrating your project into a web application you may want
			 * to provide a return url so that 7digital can notify the application when
			 * the token authorisation has completed.
			 */
			authoriseUrl = 'https://account.7digital.com/' + options.oauthkey + '/oauth/authorise?' +
						'oauth_token=' + requestToken + '&oauth_callback=' +
						encodeURIComponent(options.callbackUrl);

			/**
			 * Pass control back to the caller so they can redirect the user to 
			 * authorise the application
			 */
			callback(null, requestToken, requestSecret, authoriseUrl);
		}
	);
};

/*
 * Gets an access token from the 7digital API for signing requests to
 * access a user's 7digital account on their behalf.
 *
 * You must generate your access token only after the user has authorised 
 * the request token.
 *
 * You can use this token and secret for signing requests to the 3-legged 
 * OAuth secured API endpoints.
 *
 * var oauthHelper = require('oauth-helper');
 * oauthHelper.getAccessToken({
 *         oauthkey: 'YOUR_KEY_HERE',
 *         oauthsecret: 'YOUR_SECRET_HERE',
 *         requesttoken: 'YOUR_TOKEN_HERE',
 *         requestsecret: 'TOKEN_SECRET_HERE'
 *     }, function accessSignedEndpoints(err, accesstoken, accesssecret) {
 *         // Access the user's locker etc
 * });
 * 
 * The options parameter should contain the following
 *  - `requesttoken` an authorised OAuth request token
 *  - `requestsecret` the corresponding OAuth request secret
 *
 * @param {Object} options
 * @param {Function} callback
 */
exports.getAccessToken = function getAccessToken(options, callback) {
	/*
	 * Cache a reference to the wrapper factory so it is
	 * captured in the step closures.
	 */
	var wrapperFactory = createOAuthWrapper;

	Step(
		function getAccessToken() {
			/*
			 * Create an OAuthv1 wrapper
			 */
			oAuth = wrapperFactory(options.oauthkey, options.oauthsecret);

			/**
			 * Request the access token with the wrapper
			 */
			oAuth.getOAuthAccessToken(options.requesttoken, options.requestsecret, this);
		},
		function parseResponse(err, oauth_access_token, oauth_access_token_secret, results) {
			var mangledResponse, accessToken, accessSecret;

			/**
			 * Pass control back to the caller to let them know an error
			 * occurred if there is one.
			 */
			if (err) {
				callback(err);
				return;
			}

			/**
			 * The OAuth endpoints on the 7digital API return XML instead of an encoded
			 * parameter response.
			 */
			mangledResponse = results['<?xml version'];

			// The OAuth endpoints on the 7digital API return XML instead of an encoded
			// parameter response so we need to parse the token and secret from the XML
			accessToken = /\<oauth_token\>([^<]*)\<\/oauth_token\>/.exec(mangledResponse)[1];
			accessSecret  = /\<oauth_token_secret\>([^<]*)\<\/oauth_token_secret\>/.exec(mangledResponse)[1];

			/**
			 * Pass control back to the caller with the accesstoken and secret
			 */
			callback(null, accessToken, accessSecret);
		}
	);
}

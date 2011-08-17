var OAuth = require('oauth').OAuth,
	Step = require('step'),
	readline = require('readline'),
	config = require('../config').Config,
	tokenPattern = /\<oauth_token\>([^<]*)\<\/oauth_token\>/,
	secretPattern = /\<oauth_token_secret\>([^<]*)\<\/oauth_token_secret\>/,
	consumerKey = config.oauthkey,
	oAuth = new OAuth('http://api.7digital.com/1.2/oauth/requesttoken',
		'http://api.7digital.com/1.2/oauth/accesstoken',
		consumerKey, config.oauthsecret, '1.0', null, 'HMAC-SHA1');

/*
 * Generating your access token after the user has authorised the request token. You
 * will use this token for signing requests to the 3-legged OAuth secured API endpoints.
 */
Step(
	function getRequestToken() {
		oAuth.setClientOptions({
			requestTokenHttpMethod: "GET",
			accessTokenHttpMethod: "GET"
		});
		oAuth.getOAuthRequestToken(this);
	},
	function parseResponse(err, oauth_token, oauth_token_secret, results) {
		var mangledResponse, requestToken, requestSecret, authoriseUrl, 
			returnUrl, consoleInterface;

		if (err) {
			throw err;
		}

		mangledResponse = results['<?xml version'];

		// The OAuth endpoints on the 7digital API return XML instead of an encoded
		// parameter response so we need to parse the token and secret from the XML
		requestToken = tokenPattern.exec(mangledResponse)[1];
		requestSecret  = secretPattern.exec(mangledResponse)[1];

		console.log('Request token: %s', requestToken);
		console.log('Request secret: %s', requestSecret);

		// If you are integrating your project into a web application you may want
		// to provide a return url so that 7digital can notify the application when
		// the token authorisation has completed.
		returnUrl = '';
		authoriseUrl = 'https://account.7digital.com/' + consumerKey + '/oauth/authorise?' +
					'oauth_token=' + requestToken + '&oauth_callback=' +
					encodeURIComponent(returnUrl);

		console.log('Authorise Token URL: %s', authoriseUrl);

		// Tell the user to visit the authorise url
		consoleInterface = readline.createInterface(process.stdin, process.stdout);
		consoleInterface.question('Visit the link to authorise this application to' +
									' access your 7digital account.  Press enter to' +
									' continue',
			function continueAfterAuthorisation() {
				generateAccessToken(requestToken, requestSecret);

				// All done
				consoleInterface.close();
				process.stdin.destroy();
			});
	}
);

/*
 * Generating your access token after the user has authorised the request token. You
 * must use this token for signing requests to the 3-legged OAuth secured API endpoints.
 */
function generateAccessToken(requestToken, requestSecret) {
	Step(
		function getAccessToken() {
			oAuth.getOAuthAccessToken(requestToken, requestSecret, this);
		},
		function parseResponse(err, oauth_access_token, oauth_access_token_secret, results) {
			var mangledResponse, accessToken, accessSecret;

			if (err) {
				throw new Error(err);
			}

			mangledResponse = results['<?xml version'];

			// The OAuth endpoints on the 7digital API return XML instead of an encoded
			// parameter response so we need to parse the token and secret from the XML
			accessToken = /\<oauth_token\>([^<]*)\<\/oauth_token\>/.exec(mangledResponse)[1];
			accessSecret  = /\<oauth_token_secret\>([^<]*)\<\/oauth_token_secret\>/.exec(mangledResponse)[1];

			console.log('Access Token: %s', accessToken);
			console.log('Access Secret: %s', accessSecret);
		}
	);
}

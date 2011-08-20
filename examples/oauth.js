// Module dependencies
var
	Step = require('step'),
	readline = require('readline'),
	oauthHelper = require('../lib/oauth-helper'),
	// Create a readline interface for prompting the user
	consoleInterface = readline.createInterface(process.stdin, process.stdout),
	// Consumer key and secret
	consumerkey = 'YOUR_KEY_HERE',
	consumersecret = 'YOUR_SECRET_HERE';

Step(
	function getRequestToken() {
		// Get a request token using the oauth helper
		oauthHelper.getRequestToken({
			oauthkey: consumerkey,
			oauthsecret: consumersecret,
			callbackUrl: ''
			}, this);
	},
	function authorise(err, requestToken, requestSecret, authoriseUrl) {
		// Throw the error if there is one
		if (err) {
			throw new Error(err);
		}

		// Show the authorise url
		console.log('Authorise here: %s', authoriseUrl);

		// Remember the token and secret so we can access it after the
		// user presses enter
		 this.requestToken = requestToken;
		 this.requestSecret = requestSecret;

		// Tell the user to visit the authorise url
		consoleInterface.question('Visit the link to authorise this application to' +
									' access your 7digital account.  Press enter to' +
									' continue', this);
	},
	function continueAfterAuthorisation() {
		// Get an access token using the oauth helper using the authorised
		// request token and secret
		oauthHelper.getAccessToken({
				oauthkey: consumerkey,
				oauthsecret: consumersecret,
				requesttoken: this.requestToken,
				requestsecret: this.requestSecret
			}, this);
	},
	function logTheAccessToken(err, accesstoken, accesssecret) {
		// Log any error
		if (err) {
			console.log(err);
			// Close the readline interface properly so that the process
			// ends cleanly otherwise it will hang.
			consoleInterface.close();
			process.stdin.destroy();
			return;
		}

		// Write the token and secret out to the commandline
		console.log('Access Token: %s', accesstoken);
		console.log('Access Secret: %s', accesssecret);

		// Close the readline interface properly so that the process
		// ends cleanly otherwise it will hang.
		consoleInterface.close();
		process.stdin.destroy();
	}
);

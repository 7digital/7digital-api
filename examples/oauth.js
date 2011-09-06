// Module dependencies
var
	step = require('step'),
	readline = require('readline'),
	oauthHelper = require('../lib/oauth-helper'),
	// Create a readline interface for prompting the user
	consoleInterface = readline.createInterface(process.stdin, process.stdout),
	// Consumer key and secret
	consumerkey = 'YOUR_KEY_HERE',
	consumersecret = 'YOUR_SECRET_HERE';

step(
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
			console.error('Error getting the request token');
			throw new Error(err);
		}

		// Show the authorise url
		console.info('Authorise here: %s', authoriseUrl);

		// Remember the token and secret so we can access it after the
		// user presses enter
		this.requestToken = requestToken;
		this.requestSecret = requestSecret;

		// Tell the user to visit the authorise url
		consoleInterface.question('Visit the link to authorise this' +
									' application to access your 7digital' +
									'account.  Press enter to continue', this);
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
		var api, user;

		// Log any error
		if (err) {
			console.error('Error getting the access token');
			console.log(JSON.stringify(err));
			// Close the readline interface properly so that the process
			// ends cleanly otherwise it will hang.
			consoleInterface.close();
			process.stdin.destroy();
			throw new Error(err);
		}

		api = require('../index').configure({
			consumerkey: consumerkey,
			consumersecret: consumersecret
		});

		// Write the token and secret out to the commandline
		console.info('Access Token: %s', accesstoken);
		console.info('Access Secret: %s', accesssecret);
		user = new api.User();
		user.getLocker({
			accesstoken: accesstoken,
			accesssecret: accesssecret
		}, function (err, result) {
			console.log('!!!ERROR!!!');
			console.log(err);
			console.log('!!!RESULT!!!');
			console.log(result);
		});


		// Close the readline interface properly so that the process
		// ends cleanly otherwise it will hang.
		consoleInterface.close();
		process.stdin.destroy();
	}
);

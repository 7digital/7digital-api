// Module dependencies
var util = require('util'),
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
		if (err) {
			// Something went wrong, show the user and exit
			console.error('Error getting the request token');
			console.error(util.inspect(err, { depth: null, colors: true }));
			process.exit(0);
		}

		// Log the request token and secret
		console.info('Received Request Token and Secret');
		console.info('Request Token: %s', requestToken);
		console.info('Request Secret: %s', requestSecret);

		// Show the authorise url
		console.info('Authorise here: %s', authoriseUrl);

		// Remember the token and secret so we can access it after the
		// user presses enter
		this.requestToken = requestToken;
		this.requestSecret = requestSecret;

		// Tell the user to visit the authorise url
		consoleInterface.question('Visit the link to authorise this ' +
			'application to access your 7digital' +
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
	function logTheAccessToken(err, accessToken, accessSecret) {
		var api, user;

		// Close the readline interface properly so that the process
		// ends cleanly otherwise it will hang.
		consoleInterface.close();
		process.stdin.destroy();

		if (err) {
			// Something went wrong, show the user and exit
			console.error('Error getting the access token');
			console.error(util.inspect(err, { depth: null, colors: true }));
			process.exit(1);
		}

		api = require('../index').configure({
			consumerkey: consumerkey,
			consumersecret: consumersecret
		});

		// Log the access token and secret
		console.info('Received Access Token and Secret');
		console.info('Access Token: %s', accessToken);
		console.info('Access Secret: %s', accessSecret);

		user = new api.User();
		user.getLocker({
			accesstoken: accessToken,
			accesssecret: accessSecret,
			pageSize: 1
		}, function (err, response) {
			if (err) {
				// Something went wrong, show the user and exit
				console.error('An error occurred: ');
				console.error(util.inspect(err, { depth: null, colors: true }));
				process.exit(1);
			}

			console.log('Successfully accessed the user\'s locker: ');
			console.log(util.inspect(response, { depth: null, colors: true }));

			process.exit(0);
		});
	}
);

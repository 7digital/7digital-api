// Module dependencies
var util = require('util'),
	uuid = require('node-uuid'),
	step = require('step'),
	// Consumer key and secret
	// Replace these with your key
	consumerkey = process.env.NODE_API_CLIENT_TESTS_CONSUMER_KEY,
	consumersecret = process.env.NODE_API_CLIENT_TESTS_CONSUMER_SECRET,
	api = require('../index').configure({
		consumerkey: consumerkey,
		consumersecret: consumersecret,
		defaultParams: {
			// If your key is locked to a country you must add it here:
			//country: 'us'
		}
	}),
	oauth = new api.OAuth();


step(
	function createUser() {
		this.user = new api.User();
		this.username = 'node-client-test-' + uuid.v4() + '@7digital.com';
		this.password = 'top-secret';
		this.user.signup({
			emailAddress: this.username,
			password: this.password
		}, this);
	},
	function getRequestToken(err, userResponse) {
		if (err) {
			// Something went wrong, show the user and exit
			console.error('Error creating the user');
			console.error(util.inspect(err.stack, { depth: null, colors: true }));
			process.exit(0);
		}

		console.info('Created user ' + this.username);
		console.info(userResponse);

		// Get a request token using the oauth helper
		oauth.getRequestToken('http://callbackurl.com/', this);
	},
	function authorise(err, requestToken, requestSecret) {
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

		// Remember the token and secret so we can access it after the
		// user presses enter
		this.requestToken = requestToken;
		this.requestSecret = requestSecret;

		oauth.authoriseRequestToken({
			username: this.username,
			password: this.password,
			token: this.requestToken
		}, this);
	},
	function continueAfterAuthorisation(err) {
		if (err) {
			// Something went wrong, show the user and exit
			console.error('Error authorising the request token');
			console.error(util.inspect(err, { depth: null, colors: true }));
			process.exit(0);
		}

		// Get an access token using the oauth helper using the authorised
		// request token and secret
		oauth.getAccessToken({
			requesttoken: this.requestToken,
			requestsecret: this.requestSecret
		}, this);
	},
	function logTheAccessToken(err, accessToken, accessSecret) {
		if (err) {
			// Something went wrong, show the user and exit
			console.error('Error getting the access token');
			console.error(util.inspect(err, { depth: null, colors: true }));
			process.exit(1);
		}

		// Log the access token and secret
		console.info('Received Access Token and Secret');
		console.info('Access Token: %s', accessToken);
		console.info('Access Secret: %s', accessSecret);

		this.user.getLocker({
			accesstoken: accessToken,
			accesssecret: accessSecret,
			pageSize: 1
		}, this);
	},function showLocker(err, lockerResponse) {
		if (err) {
			// Something went wrong, show the user and exit
			console.error('An error occurred: ');
			console.error(util.inspect(err, { depth: null, colors: true }));
			process.exit(1);
		}

		console.log('Successfully accessed the user\'s locker: ');
		console.log(util.inspect(lockerResponse, { depth: null, colors: true }));

		process.exit(0);
	}
);


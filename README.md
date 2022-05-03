| :warning: | This repo is specific to the 7digital download store, and is not actively maintained. <br><br>For new integrations with the 7digital platform, we recommend referring to our [public documentation](https://docs.7digital.com/reference) and [integration guides](https://docs.7digital.com/docs). | :warning: |
| --- | --- | --- |

---

![7digital](http://i.imgur.com/StUnvCy.png?1)
# Node.js API Client

Current head build status:

[![Build Status](https://travis-ci.org/7digital/7digital-api.svg?branch=master)](https://travis-ci.org/7digital/7digital-api)

## About 7digital


7digital.com is an online music store operating in over 16 countries and
offering more than 11 million high quality DRM free MP3s (320kbps) from all
major labels and wide range of idependent labels and distributors. 7digital
API will give you access to the full catalogue including high quality album
art, 30s preview clips for all tracks, commissions on sales, integrated
purchasing and full length streaming. More details at
[developer.7digital.net](http://developer.7digital.net/)

### What is this?


A serverside javascript client for the 7digital API .
Full code documentation for the most recent release can be found [here](http://raoulmillais.github.com/node-7digital-api/api.html).

To map documentation endpoints with this library's methods, it's best to look
 at the [API definition file](https://github.com/7digital/7digital-api/blob/master/assets/7digital-api-schema.json).

### Installation


[![NPM](https://nodei.co/npm/7digital-api.png?downloads=true)](https://nodei.co/npm/7digital-api/)

Install it via [npm](http://npmjs.org/)

```bash
npm install --save 7digital-api
```

### Usage


See the examples folder for examples of how to use this.  If you have included
7digital-api in your dependencies in the package.json file, you can use the
like so:

```javascript
var api = require('7digital-api'),
	artists = new api.Artists();

artists.getReleases({ artistid: 1 }, function(err, data) {
	console.dir(data);
});
```

To supply your OAuth credentials or if you want XML responses, you can use the
configure function.  Here is how you can do so:


```javascript
var api, artists;

api = require('7digital-api').configure({
	format: 'XML',
	consumerkey: 'MY_KEY_HERE',
	consumersecret: 'MY_SECRET_HERE',
	defaultParams: { country: 'fr' }
});

artists = new api.Artists();

artists.getReleases({ artistid: 1 }, function(err, data) {
	console.dir(data);
});
```

You can specify default parameters on a per resource basis also:


```javascript
var api, artists;

api = require('7digital-api').configure({
	defaultParams: {
		country: 'fr'
	}
});

artists = new api.Artists({ defaultParams: { pageSize: 15 } });

artists.getReleases({ artistid: 1 }, function(err, data) {
	// 15 releases in france
	console.dir(data);
});
```

See [developer.7digital.net](http://developer.7digital.net/) for full details
of the API endpoints and the parameters they accept.

## OAuth protected endpoints

**NOTE: The oauth access method changed considerably in 0.19.0, updating to
the latest version is highly recommended**

### Accessing the media delivery api

The media delivery endpoints behave differently from the other endpoints as
they return you the bytes to the content. You must sign all your requests like
so:

```javascript
var api = require('7digital-api').configure({
	consumerkey: 'YOUR_KEY_HERE',
	consumersecret: 'YOUR_SECRET_HERE',
	defaultParams: {
		country: 'es'
	}
});

var oauth = new api.OAuth();
var previewUrl = oauth.sign('http://previews.7digital.com/clip/12345');

// For access to locker / subscription streaming without managed users you
// will need to provide the accesstoken and secret for the user
var signedUrl = oauth.sign('https://stream.svc.7digital.net/stream/locker', {
	trackId: 1234,
	formatId: 26,
	accesstoken: 'ACCESS_TOKEN',
	accesssecret: 'ACCESS_SECRET'
});
// Requesting this URL will now respond with the media data (or redirect to
// an error).
```

### Making requests on behalf of a user to OAuth protected endpoints

**NOTE: The oauth access method changed considerably in 0.19.0**

This example assumes you have access to the oauth/requestToken/authorise
endpoint to authenticate users.  If you do not have this access you will
need to send the user to the authoriseUrl provided by `getRequestToken`
and complete the auth flow when your callbackUrl is hit.

```javascript
var api = require('7digital-api').configure({
	consumerkey: 'YOUR_KEY_HERE',
	consumersecret: 'YOUR_SECRET_HERE',
	defaultParams: {
		country: 'fr'
	}
});

var oauth = new api.OAuth();
oauth.getRequestToken('http://callbackurl.com/', authoriseToken);
function authoriseToken(err, requesttoken, requestsecret) {
	oauth.authoriseRequestToken({
		username: 'joe@bloggs.com',
		password: 'top-secret',
		token: requesttoken
	}, function (err) {
		oauth.getAccessToken({
			requesttoken: requesttoken,
			requestsecret: requestsecret
		}, function (err, accesstoken, accesssecret) {
			// use the token and secret to call secure endpoints.
			var apiForJoeBloggs = api.reconfigure({
				defaultParams: {
					accesstoken: accesstoken,
					accesssecret: accesssecret
				}
			});
			var user = new apiForJoeBloggs.User();
			user.getLocker({
				pageSize: 1
			}, function (err, response) {
				// Do something with the locker
			});
		});
	});
```

See oauth.js and create-user.js in the examples folder for examples of the
OAuth flow for acquiring an authorised access token and secret that you will
need to access any of the protected endpoints on behalf of a user.

### Partner users (3rd party user management)

If your key has permissions to create 3rd-party (partner) users, you must
configure the client to allow you to access protected enpoints with your
user ids instead of access tokens.  This can be done like so:

```javascript
var api = require('7digital-api').configure({
	consumerkey: 'YOUR_KEY_HERE',
	consumersecret: 'YOUR_SECRET_HERE',
	userManagement: true,
	defaultParams: {
		country: 'fr'
	}
});

// You can now access user endpoints for your users without an access token or
// secret and with your external user id instead
api.User().create({
	userId: 'external-user-12345',
	emailAddress: 'joe@bloggs.com'
	}, function (err, userResponse) {
		api.User().getLocker({
			userId: 'external-user-12345',
			pageSize: 1
		}, function (err, response) {
		// Do something with the user's (empty!) locker
	});
});
```

### Using the environment to configure the client

The client will check the environment for the following variables which makes
it possible to keep your key and secret actually secret:

- `_7D_API_CLIENT_CONSUMER_KEY` - defaults to 'YOUR_KEY_HERE'
- `_7D_API_CLIENT_CONSUMER_SECRET` - defaults to 'YOUR_SECRET_HERE'
- `_7D_API_CLIENT_USER_TOKEN` - is not set by default
- `_7D_API_CLIENT_USER_SECRET` - is not set by default

The client will check the environment for the following variables which makes
controlling the behaviour per-environment easier (e.g. in tests) with out
having to branch in your application code:

- `_7D_API_CLIENT_HOST` - defaults to 'api.7digital.com'
- `_7D_API_CLIENT_SSL_HOST` - defaults to 'api.7digital.com'
- `_7D_API_CLIENT_PORT` - defaults to 80
- `_7D_API_CLIENT_PREFIX` - defaults to '1.2'

Note that these variables have the lowest precedence (apart from defaults).
I.E. overriding them in application code will take precendence.

### Running the tests

Requires node 4.8.3.

To run the unit tests:

    npm test

There are also integration tests. Tests for various error handling scenarios
are run against a stub 7d api. It can be installed with:

    npm install https://github.com/7digital/api-stub.git

Some of the integration tests (around the client's handling of OAuth) run
against the real 7d api. In order for these tests to work, you'll need to set
the environment variables outlined above. As well as the following:

- `_7D_API_CLIENT_TEST_VOUCHER_CODE`

The code for a voucher which can be applied to a basket containing an item of
1p, used for a two-legged OAuth test.

The tests can then be run with:

    npm run integration-test

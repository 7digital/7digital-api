'use strict';

var path = require('path'),
	noopCache = require('./lib/noop-cache');

module.exports = {
	// Your API consumer key for accessing oauth secured endpoints
	// see http://api.7digital.com/1.2/static/documentation/7digitalpublicapi.html#Introduction
	//
	// @type string
	consumerkey: 'YOUR_KEY_HERE',
	// Your oauth consumer secret for signing oauth secured request urls.
	//
	// @type string
	consumersecret: 'YOUR_SECRET_HERE',
	// The desired format of API responses
	// Sets format to JSON by default
	//
	// @type string
	format: 'json',
	// A logger object for outputting messages. This should be an obect, which
	// has function properties for each of the npm loglevels. Winston provides
	// a default implementation.
	//
	// @type {Winston.Logger} or any object which defines methods for each of
	// the npm loglevels.
	logger: require('./lib/logger'),
	// If your key allows you two legged access to manage user accounts
	// either for creating 3rd party partner accounts or by providing
	// access to user details using a userId then you should set this
	// to true.  This changes all 3-legged oauth endpoints to 2-legged.
	//
	// This option is not reconfigurable using `reconfigure`
	//
	// @type {Boolean} whether user management is enabled for your key.
	userManagement: false,
	// A response cache client
	//
	// @type {Object} An object providing get and set functions.
	cache: require('./lib/noop-cache'),
	// A hash of parameters to provide with every GET request made to the API
	//
	// @type {Object} A hash contining querystring parameters
	defaultParams: {},
	// A hash of custom headers to provide with every request made to the API
	//
	// @type {Object} A hash contining the headers
	headers: {}
};

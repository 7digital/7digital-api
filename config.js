'use strict';

var path = require('path');

function envOrDefault(key, def) {
	return process.env[key] || def;
}

module.exports = {
	// Your API oauth consumer key for accessing oauth secured endpoints
	// see http://api.7digital.com/1.2/static/documentation/7digitalpublicapi.html#Introduction
	//
	// @type string
	consumerkey: envOrDefault('_7D_API_CLIENT_CONSUMER_KEY', 'YOUR_KEY_HERE'),
	// Your oauth consumer secret for signing oauth secured request urls.
	//
	// @type string
	consumersecret: envOrDefault('_7D_API_CLIENT_CONSUMER_SECRET',
			'YOUR_SECRET_HERE'),
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
	// A hash of parameters to provide with every GET request made to the API
	//
	// @type {Object} A hash contining querystring parameters
	defaultParams: {
		usageTypes: 'download'
	},
	// A hash of custom headers to provide with every request made to the API
	//
	// @type {Object} A hash contining the headers
	headers: {}
};

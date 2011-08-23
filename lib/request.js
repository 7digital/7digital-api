var http = require('http'),
	querystring = require('querystring'),
	sys = require('sys'),
	underscore = require('underscore'),
	helpers = require('./helpers'),
	USER_AGENT = 'Node.js HTTP Client';

// Request
//
// Creates a new API base class for accessing a resource at the given
// host with optional predefined oauth credentials.
//
// The options argument should contain the following properties:
//
// - *host* - The hostname of the API
// - *version* - The version of the API to use
// - *consumerkey* - Your application's oauth consumerkey
// - *consumersecret* - Your application's oauth consumer secret for signing
//                      secure requests.
// - *logger* - A Winston.Logger instance for output
// - *format* - The response format you would like to receive when making
//              requests
// - *authtype* - (optional) Either '2-legged' or '3-legged' for oauth requests
//
// - @param {Object} options
// - @constructor
var Request = function (options) {
	this.host = options.host;
	this.version = options.version;
	this.logger = options.logger;
	this.format = options.format;
	this.consumerkey = options.consumerkey;
	this.consumersecret = options.consumersecret;
	this.authtype = options.authtype;
};

// Formats request parameters as expected by the API.
//
// - @param {Object} data - hash of pararameters
// - @return {String} - Encoded parameter string
Request.prototype.prepare = function (data) {
	var prop;
	data = data || {};

	for (prop in data) {
		if (data.hasOwnProperty(prop)) {
			if (underscore.isDate(data[prop])) {
				data[prop] = helpers.toYYYYMMDD(data[prop]);
			}
		}
	}

	data.oauth_consumer_key = this.consumerkey;

	return querystring.stringify(data);
};

// Determines the path for a given action on a resource
//
// @param {String} resource
// @param {String} action
Request.prototype.formatPath = function (resource, action) {
	// Until node >=0.5.0 becomes more stable and express becomes compatible
	// we cannot use util.format().
	var requestPath = '/' + this.version + '/' + resource;

	if (action !== '') {
		requestPath += '/' + action;
	}

	return requestPath;
};

// Generates the default headers for an API request
//
// - @return {Object}
Request.prototype.createHeaders = function () {
	return {
		'host': this.host,
		'User-Agent' : USER_AGENT
	};
};

// Makes a GET request to the API.
//
// @param {String} url - the URL on the API to make the GET request to.
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
Request.prototype.get = function (url, data, callback) {
	this.makeRequest(url, 'GET', data, callback);
};

// Makes a POST request to the API.
//
// @param {String} url - the URL on the API to make the GET request to.
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
Request.prototype.post = function (url, data, callback) {
	this.makeRequest(url, 'POST', data, callback);
};

// Dispatches requests to the API.  Serializes the data in keeping with the API
// specification and applies approriate HTTP headers.
//
// @param {String} url - the URL on the API to make the request to.
// @param {String} httpMethod
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
Request.prototype.makeRequest = function (url, httpMethod, data, callback) {
	var apiRequest, httpClient, headers, prop, self = this;

	data = this.prepare(data);
	if (httpMethod === 'GET') {
		url = url + '?' + data;
	}

	this.logger.log(httpMethod + ': ' + url);
	httpClient = http.createClient(80, this.host);
	apiRequest = httpClient.request(httpMethod, url, this.createHeaders());

	apiRequest.on('response', function handleResponse(response) {
		var responseBuffer;

		response.setEncoding("utf8");
		response.on("data", function bufferData(chunk) {
			responseBuffer += chunk;
		});

		response.on("end", function endResponse() {
			callback(responseBuffer);
		});
	});

	apiRequest.on('error', function logError(data) {
		self.logger.log('Error fetching [' + url + ']. Body:\n' + data);
	});

	if (httpMethod === 'GET') {
		apiRequest.end();
	} else {
		apiRequest.end(data);
	}
};

module.exports = Request;

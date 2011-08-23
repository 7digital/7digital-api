var http = require('http'),
	querystring = require('querystring'),
	sys = require('sys'),
	underscore = require('underscore'),
	helpers = require('./helpers'),
	USER_AGENT = 'Node.js HTTP Client';

// APIRequest
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
var APIRequest = function (options) {
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
APIRequest.prototype.prepare = function (data) {
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
APIRequest.prototype.formatPath = function (resource, action) {
	// Until node >=0.5.0 becomes more stable and express becomes compatible
	// we cannot use util.format().
	var requestPath = '/' + this.version + '/' + resource;

	if (action !== '') {
		requestPath += '/' + action;
	}

	return requestPath;
};

// Dispatches GET requests to the API.  Serializes the data into a
// querystring including date serialisation in keeping with the API
// specification and applies approriate HTTP headers.
//
// @param {String} url - the URL on the API to make the GET request to.
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
APIRequest.prototype.get = function (url, data, callback) {
	var apiRequest, httpClient, headers, prop, self = this;

	data = this.prepare(data);
	url = url + '?' + data;

	this.logger.log('GET: ' + url);
	headers = {
		'host': this.host,
		'User-Agent' : USER_AGENT
	};
	httpClient = http.createClient(80, this.host);
	apiRequest = httpClient.request('GET', url, headers);

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

	apiRequest.end();
};

exports.APIRequest = APIRequest;

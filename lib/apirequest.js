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
// - *format* - The response format you would like to receive when making requests
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
};

// Dispatches GET requests to the API.  Serializes the data into a
// querystring including date serialisation in keeping with the API
// specification and applies approriate HTTP headers.
APIRequest.prototype.get = function (resource, action, data, callback) {
	var requestUrl = '/' + this.version + '/' + resource,
		apiRequest, httpClient, headers, prop, qs, self = this;

	if (action !== '') {
		requestUrl += '/' + action;
	}

	data = data || {};
	for (prop in data) {
		if (data.hasOwnProperty(prop)) {
			if (underscore.isDate(data[prop])) {
				data[prop] = helpers.toYYYYMMDD(data[prop]);
			}
		}
	}

	data.oauth_consumer_key = this.consumerkey;

	qs = querystring.stringify(data);
	requestUrl += '?' + qs;

	this.logger.log('GET: ' + requestUrl);
	headers = {
		'host': this.host,
		'User-Agent' : USER_AGENT
	};
	httpClient = http.createClient(80, this.host);
	apiRequest = httpClient.request('GET', requestUrl, headers);

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
		self.logger.log('Error fetching [' + requestUrl + ']. Body:\n' + data);
	});

	apiRequest.end();
};

exports.APIRequest = APIRequest;

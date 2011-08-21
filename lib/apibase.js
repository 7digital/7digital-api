"use strict";

var http = require('http'),
	querystring = require('querystring'),
	sys = require('sys'),
	xml2js = require('../vendor/node-xml2js/lib/xml2js'),
	_ = require('underscore'),
	helpers = require('./helpers'),
	config = require("../config").Config,
	USER_AGENT = 'Node.js HTTP Client';

// APIBase
// 
// Creates a new API base class for accessing a resource at the given
// host with optional predefined oauth credentials.
// 
// - @constructor
var APIBase = function(name, host, version, oauthkey /* optional */, 
						oauthsecret /* optional */, logger /* optional */) {
	this.host = host;
	this.version = version;
	this.logger = logger;
	this.consumerkey = oauthkey;
	this.consumersecret = oauthsecret;
};

//
// Callback for parsing the XML response return from the API
// and converting it to JSON and handing control back to the
// caller.
// 
// - @param {Function} callback - the caller's callback
// - @param {String} response - the XML response from the API
APIBase.prototype.parseResponse = function(callback, response) {
	var parser = new xml2js.Parser(),
		self = this;

	parser.on('end', function(result) {
		if (self.format === 'json') {
			// Manually remove the xml namespaces
			delete result['xmlns:xsi'];
			delete result['xsi:noNamespaceSchemaLocation'];

			response.json = result;

			if (result.status == 'error') {
				callback(result.error);
			}
			else {
				callback(null, response.json);
			}
		}
		else {
			callback(null, response.xml);
		}
	});

	this.logger.log('parsing raw response');
	parser.parseString(response.xml + '');
};

// Dispatches GET requests to the API.  Serializes the data into a
// querystring including date serialisation in keeping with the API
// specification for the caller and applies approriate HTTP headers.
APIBase.prototype.doGetRequest = function(action, data, callback) {
	var requestUrl = '/' + this.version + '/' + this.resourceUrlSlug,
		self = this;

	if (action != '') {
		requestUrl += '/' + action;
	}
	
	data = data || {};
	for (var prop in data) {
		if (data.hasOwnProperty(prop)) {
			if (_.isDate(data[prop])) {
				data[prop] = helpers.toYYYYMMDD(data[prop]);
			}
		}
	}

	data.oauth_consumer_key = this.consumerkey;

	var that = { format: this.format};

	var qs = querystring.stringify(data);
	requestUrl += '?' + qs;

	this.logger.log('GET: ' + requestUrl);
	var host = this.host,
		headers = {
			'host': host,
			'User-Agent' : USER_AGENT
		},
		httpClient = http.createClient(80, host),
		apiRequest = httpClient.request('GET', requestUrl, headers);
	
	apiRequest.on('response', function handleResponse(response) {
		var responseBody = {
				xml: ""
		};

		response.setEncoding("utf8");

		response.on("data", function bufferData(chunk) {
			responseBody.xml += chunk;
		});

		response.on("end", function endResponse() {
			callback = _.bind(callback, self);
			callback(responseBody);
		});
	});

	apiRequest.on('error', function logError(data) {
		self.logger.log('Error fetching [' + url + ']. Body:\n' + data);
	});

	apiRequest.end();
};

// Utility method for creating the necessary methods on the 
// resource class for calling through to the API.
//
// - @param {Mixed} apiCallDefinition - Either a string if the 
// action method name is the same as the action path component
// on the underlying API call or a hash if they differ.
APIBase.prototype.buildApiCall = function(apiCallDefinition) {
	var fnName;
	
	if (_.isString(apiCallDefinition)) {
		fnName = 'get' + helpers.capitalize(apiCallDefinition);
	} else {
		fnName = apiCallDefinition.methodName;
		apiCallDefinition = apiCallDefinition.apiCall;
	}
	
	this.prototype[fnName] = function(params, callback) {
		var self = this;
	
		this.doGetRequest(apiCallDefinition, params,
			_.bind(this.parseResponse, self, callback));
	};
};

exports.APIBase = APIBase;

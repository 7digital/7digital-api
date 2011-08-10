"use strict";

/**
 * Module dependencies.
 */
var http = require('http'),
	querystring = require('querystring'),
	sys = require('sys'),
	xml2js = require('../vendor/node-xml2js/lib/xml2js'),
	FnUtils = require('./fnutils').FnUtils,
	DateUtils = require('./dateutils').DateUtils,
	StringUtils = require('./stringutils').StringUtils,
	config = require("../config").Config,
	USER_AGENT = 'Node.js HTTP Client';

/**
 * APIBase
 *
 * Creates a new RESTful API base class for accessing a resource at the given 
 * host with optional predefined oauth credentials.
 *
 * @constructor
 */
var APIBase = function(name, host, version, oauthkey /* optional */, oauthsecret /* optional */,
						logger /* optional */) {
	this.host = host;
	this.version = version;
	this.logger = logger;
	
	if (oauthkey) {
		this.oauth_consumer_key = oauthkey;
	}

	if (oauthsecret) {
		this.oauth_consumer_secret = oauthsecret;
	}
};

/*
 * Instance methods
 */
APIBase.prototype.parseResponse = function(callback, response) {
	var parser = new xml2js.Parser(),
		self = this;

	parser.on('end', function(result) {
		if (self.format === 'json') {
      delete result.status;
      console.log('****' + result);
			response.json = function (result) {
        /*
        * removing xml namespaces manually
        * (probably a better way to do this, like the parser for example)
        */
        delete result.status;
        delete result.version;
        delete result['xmlns:xsi'];
        delete result['xsi:noNamespaceSchemaLocation'];
      };

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

APIBase.prototype.doGetRequest = function(action, data, callback) {
	var requestUrl = '/' + this.version + '/' + this.resourceUrlSlug,
		self = this;

	if (action != '') {
		requestUrl += '/' + action;
	}
	
	data = data || {};
	for (var prop in data) {
		if (data.hasOwnProperty(prop)) {
			if (DateUtils.isDate(data[prop])) {
				data[prop] = DateUtils.toYYYYMMDD(data[prop]);
			}
		}
	}

	// Default the oauth credentials if not supplied and we have them
	if (!data.oauth_consumer_key && this.oauth_consumer_key) {
		data.oauth_consumer_key = this.oauth_consumer_key;
	}

	if (!data.oauth_consumer_secret && this.oauth_consumer_secret) {
		data.oauth_consumer_secret = this.oauth_consumer_secret;
	}

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
			FnUtils.bind(self, callback(responseBody));
		});
	});

	apiRequest.on('error', function logError(data) {
		self.logger.log('Error fetching [' + url + ']. Body:\n' + data);
	});

	apiRequest.end();
};

APIBase.prototype.buildApiCall = function(apiCallDefinition) {
	var fnName;
	
	if (typeof apiCallDefinition === 'string') {
		fnName = 'get' + StringUtils.capitalize(apiCallDefinition);
	} else {
		fnName = apiCallDefinition.methodName;
		apiCallDefinition = apiCallDefinition.apiCall;
	}
	
	this.prototype[fnName] = function(params, callback) {
		var self = this;
	
		this.doGetRequest(apiCallDefinition, params,
                      FnUtils.curry(FnUtils.bind(self, this.parseResponse),
                                    callback));
	};
};

/*
 * Exports
 */
exports.APIBase = APIBase;

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
	USER_AGENT = 'Node.js HTTP Client';

/**
 * APIBase
 *
 * Creates a new RESTful API base class for accessing a resource at the given 
 * host with optional predefined oauth credentials.
 *
 * @constructor
 */
var APIBase = function(name, host, version, oauthkey /* optional */, oauthsecret /* optional */) {
	// TODO: Looks like we don't need the name parameter here anymore
	this.host = host;
	this.version = version;

	if (oauthkey) {
		this.oauth_consumer_key = oauthkey;	
	}

	if (oauthsecret) {
		this.oauth_consumer_secret = oauthsecret;
	}

	this.format = 'text';
};

/*
 * Instance methods
 */
APIBase.prototype.parseResponse = function(callback, response) {
	var parser = new xml2js.Parser();

	parser.addListener('end', function(result) {
		response.json = result;
		if (result.status == 'error') {
			callback(result.error);
		}
		else {
			callback(null, response);
		}
	});

	parser.parseString(response.xml + '');
};

APIBase.prototype.doGetRequest = function(action, data, callback) {
	var requestUrl = '/' + this.version + '/' + this.resourceUrlSlug;

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

	var qs = querystring.stringify(data);
	requestUrl += '?' + qs;

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
			callback(responseBody);
		});
	});

	apiRequest.on('error', function logError(data) {
		sys.puts('Error fetching [' + url + ']. Body:\n' + data);
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
		this.doGetRequest(apiCallDefinition, params, FnUtils.curry(this.parseResponse, callback));
	};
};

/*
 * Exports
 */
exports.APIBase = APIBase;

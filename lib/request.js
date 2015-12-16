'use strict';

var util = require('util');
var http = require('http');
var parameters = require('./parameters');
var ApiHttpError = require('./errors').ApiHttpError;
var OAuthError = require('./errors').OAuthError;
var qs = require('querystring');
var _ = require('lodash');
var helpers = require('./helpers');
var oauthHelper = require('./oauth');
var USER_AGENT = 'Node.js HTTP Client';
var RequestFailedError = require('./errors').RequestFailedError;

// Formats request parameters as expected by the API.
//
// - @param {Object} data - hash of pararameters
// - @param {String} consumerkey - consumer key
// - @return {String} - Encoded parameter string
function prepare(data, consumerkey) {
	var prop;
	data = data || {};

	for (prop in data) {
		if (data.hasOwnProperty(prop)) {
			if (_.isDate(data[prop])) {
				data[prop] = helpers.toYYYYMMDD(data[prop]);
			}
		}
	}

	data.oauth_consumer_key = consumerkey;

	return data;
}

// Generates the default request headers
//
// - @return {Object}
function createHeaders(host, headers) {
	return _.extend({}, headers, {
		'host': host,
		'User-Agent' : USER_AGENT
	});
}

// Logs out a headers hash
//
// - @param {Object} logger - The logger to use
// - @param {Object} headers - The hash of headers to log
function logHeaders(logger, headers) {
	return _.each(_.keys(headers), function (key) {
		logger.info(key + ': ' + headers[key]);
	});
}

// Makes a GET request to the API.
//
// - @param {Object} endpointInfo - Generic metadata about the endpoint to hit.
// - @param {Object} requestData - Parameters for this specific request.
// - @param {Object} headers - Custom headers for this request.
// - @param {Object} credentials - OAuth consumerkey and consumersecret.
// - @param {Object} logger - An object implementing the npm log levels.
// - @param {Function} callback - The callback to call with the response.
function get(endpointInfo, requestData, headers, credentials, logger,
	callback) {

	var normalisedData = prepare(requestData, credentials.consumerkey);
	var fullUrl = endpointInfo.url + '?' + qs.stringify(normalisedData);
	var hostInfo = {
		host: endpointInfo.host,
		port: endpointInfo.port
	};

	// Decide whether to make an oauth signed request or not
	if (endpointInfo.authtype) {
		hostInfo.host = endpointInfo.sslHost;
		dispatchSecure(endpointInfo.url, 'GET', requestData, headers,
			endpointInfo.authtype, hostInfo, credentials, logger,
			callback);
	} else {
		dispatch(endpointInfo.url, 'GET', requestData, headers, hostInfo,
			credentials, logger, callback);
	}
}

// Makes a POST/PUT request to the API.
//
// - @param {String} httpMethod - POST or PUT.
// - @param {Object} endpointInfo - Generic metadata about the endpoint to hit.
// - @param {Object} requestData - Parameters for this specific request.
// - @param {Object} headers - Headers for this request.
// - @param {Object} credentials - OAuth consumerkey and consumersecret.
// - @param {Object} logger - An object implementing the npm log levels.
// - @param {Function} callback - The callback to call with the response.
function postOrPut(httpMethod, endpointInfo, requestData, headers, credentials,
	logger, callback) {

	var hostInfo = {
		host: endpointInfo.host,
		port: endpointInfo.port
	};

	if (endpointInfo.authtype) {
		hostInfo.host = endpointInfo.sslHost;
		dispatchSecure(endpointInfo.url, httpMethod, requestData, headers,
			endpointInfo.authtype, hostInfo, credentials, logger, callback);
	} else {
		dispatch(endpointInfo.url, httpMethod, requestData, headers, hostInfo,
			credentials, logger, callback);
	}
}

function buildSecureUrl(httpMethod, hostInfo, path, requestData) {
	var querystring = httpMethod === 'GET'
		? '?' + qs.stringify(requestData)
		: '';
	path = parameters.template(path, requestData);
	return 'https://' + hostInfo.host + ':' + hostInfo.port + path + querystring;
}

// Dispatches an oauth signed request to the API
//
// - @param {String} url - the path of the API url to request.
// - @param {String} httpMethod
// - @param {Object} requestData - hash of the parameters for the request.
// - @param {Object} headers - Headers for this request.
// - @param {String} authType - OAuth request type: '2-legged' or '3-legged'
// - @param {Object} hostInfo - API host information
// - @param {Function} callback - The callback to call with the response.
function dispatchSecure(path, httpMethod, requestData, headers, authtype,
		hostInfo, credentials, logger, callback) {
	var url;
	var is2Legged = authtype === '2-legged';
	var token = is2Legged ? null : requestData.accesstoken;
	var secret = is2Legged ? null : requestData.accesssecret;
	var mergedHeaders = createHeaders(hostInfo.host, headers);
	var oauthClient = oauthHelper.createOAuthWrapper(credentials.consumerkey,
			credentials.consumersecret, mergedHeaders);
	var methodLookup = {
		'POST' : oauthClient.post.bind(oauthClient),
		'PUT' : oauthClient.put.bind(oauthClient)
	};
	var oauthMethod = methodLookup[httpMethod];

	hostInfo.port = hostInfo.port || 443;

	requestData = prepare(requestData, credentials.consumerkey);

	if (!is2Legged) {
		delete requestData.accesstoken;
		delete requestData.accesssecret;
	}

	url = buildSecureUrl(httpMethod, hostInfo, path, requestData);

	logger.info('token: ' + token + ' secret: ' + secret);
	logger.info(httpMethod + ': ' + url + ' (' + authtype + ' oauth)');
	logHeaders(logger, mergedHeaders);

	function cbWithDataAndResponse(err, data, response) {
		var apiError;

		if (err) {
			// API server error
			if (err.statusCode && err.statusCode >= 400) {
				// non 200 status and string for response body is usually an
				// oauth error from one of the endpoints
				if (typeof err.data === 'string' && /oauth/i.test(err.data)) {
					apiError = new OAuthError(err.data, err.data + ': ' +
						path);
				} else {
					apiError = new ApiHttpError(
					response.statusCode, err.data, path);
				}

				return callback(apiError);
			}

			// Something unknown went wrong
			logger.error(err);
			return callback(err);
		}

		return callback(null, data, response);
	}

	if (httpMethod === 'GET') {
		return oauthClient.get(url, token, secret, cbWithDataAndResponse);
	}

	if ( oauthMethod ) {
		logger.info('DATA: ' + qs.stringify(requestData));
		return oauthMethod(url, token, secret, requestData,
			'application/x-www-form-urlencoded', cbWithDataAndResponse);
	}

	return callback(new Error('Unsupported HTTP verb: ' + httpMethod));
}

// Dispatches requests to the API.  Serializes the data in keeping with the API
// specification and applies approriate HTTP headers.
//
// - @param {String} url - the URL on the API to make the request to.
// - @param {String} httpMethod
// - @param {Object} data - hash of the parameters for the request.
// - @param {Object} headers - Headers for this request.
// - @param {Object} hostInfo - hash of host, port and prefix
// - @param {Object} credentials - hash of oauth consumer key and secret
// - @param {Object} logger - an object implementing the npm log levels
// - @param {Function} callback
function dispatch(url, httpMethod, data, headers, hostInfo, credentials,
		logger, callback) {

	hostInfo.port = hostInfo.port || 80;

	var apiRequest, prop, hasErrored;
	var mergedHeaders = createHeaders(hostInfo.host, headers);
	var apiPath = url;

	data = prepare(data, credentials.consumerkey);

	// Special case for track previews: we explicitly request to be given
	// the XML response back instead of a redirect to the track download.
	if (url.indexOf('track/preview') >= 0) {
		data.redirect = 'false';
	}

	if (httpMethod === 'GET') {
		url = url + '?' + qs.stringify(data);
	}

	logger.info(util.format('%s: http://%s:%s%s', httpMethod,
		hostInfo.host, hostInfo.port, url));
	logHeaders(logger, mergedHeaders);

	// Make the request
	apiRequest = http.request({
		method: httpMethod,
		// disable connection pooling to get round node's unnecessarily low
		// 5 max connections
		agent: false,
		hostname: hostInfo.host,
		// Force scheme to http for browserify otherwise it will pick up the
		// scheme from window.location.protocol which is app:// in firefoxos
		scheme: 'http',
		// Set this so browserify doesn't set it to true on the xhr, which
		// causes an http status of 0 and empty response text as it forces
		// the XHR to do a pre-flight access-control check and the API
		// currently does not set CORS headers.
		withCredentials: false,
		path: url,
		port: hostInfo.port,
		headers: mergedHeaders
	}, function handleResponse(response) {
		var responseBuffer = '';

		if (typeof response.setEncoding === 'function') {
			response.setEncoding('utf8');
		}

		response.on('data', function bufferData(chunk) {
			responseBuffer += chunk;
		});

		response.on('end', function endResponse() {
			if (+response.statusCode >= 400) {
				return callback(new ApiHttpError(
					response.statusCode, responseBuffer, apiPath));
			}

			if (!hasErrored) {
				return callback(null, responseBuffer, response);
			}
		});
	});

	apiRequest.on('error', function logErrorAndCallback(data) {
		// Flag that we've errored so we don't call the callback twice
		// if we get an end event on the response.
		hasErrored = true;
		logger.info('Error fetching [' + url + ']. Body:\n' + data);

		return callback(
			new RequestFailedError(data, 'Error connecting to ' + url)
		);
	});

	if (httpMethod === 'GET') {
		apiRequest.end();
	} else {
		apiRequest.end(data);
	}
}

module.exports.get = get;
module.exports.postOrPut = postOrPut;
module.exports.createHeaders = createHeaders;
module.exports.prepare = prepare;
module.exports.dispatch = dispatch;
module.exports.dispatchSecure = dispatchSecure;

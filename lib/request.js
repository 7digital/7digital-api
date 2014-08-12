'use strict';

var util = require('util');
var http = require('http');
var actionhelper = require('./actionhelper');
var ApiHttpError = require('./errors').ApiHttpError;
var cache = require('./cache');
var qs = require('querystring');
var _ = require('lodash');
var helpers = require('./helpers');
var oauthHelper = require('./oauth');
var USER_AGENT = 'Node.js HTTP Client';

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
// - @param {Object} theCache - A response cache.
// - @param {Function} callback - The callback to call with the response.
function get(endpointInfo, requestData, headers, credentials, logger, theCache,
	callback) {

	var normalisedData = prepare(requestData, credentials.consumerkey);
	var fullUrl = endpointInfo.url + '?' + qs.stringify(normalisedData);
	var cacheKey = cache.generateCacheKeyFromUrl(fullUrl);
	var hostInfo = {
		host: endpointInfo.host,
		port: endpointInfo.port
	};

	theCache.get(cacheKey, checkCacheResult);
	function checkCacheResult(err, res) {
		if (err) {
			logger.error('Error checking cache for %s', cacheKey);
			logger.error(err);
			return callback(err);
		}

		if (res) {
			logger.info('Cache hit for %s', cacheKey);
			return callback(null, res);
		}

		// Decide whether to make an oauth signed request or not
		if (endpointInfo.authtype) {
			dispatchSecure(endpointInfo.url, 'GET', requestData, headers,
				endpointInfo.authtype, hostInfo, credentials, logger,
				cacheAndCallback);
		} else {
			dispatch(endpointInfo.url, 'GET', requestData, headers, hostInfo,
				credentials, logger, cacheAndCallback);
		}

		function cacheAndCallback(err, requestData, response) {
			if (err) {
				return callback(err);
			}

			var ttl = cache.parseMaxAgeHeader(response);

			if (ttl) {
				theCache.set(cacheKey, requestData, ttl, callbackWithResult);
			} else {
				return callback(null, requestData, response);
			}

			function callbackWithResult(err) {
				if (err) {
					logger.error('Error setting %s to cache', cacheKey);
					logger.error(err);
					return callback(err);
				}

				logger.info('Cached %s for %s seconds', cacheKey, ttl);
				return callback(null, requestData, response);
			}
		}
	}
}

// Makes a POST request to the API.
//
// - @param {Object} endpointInfo - Generic metadata about the endpoint to hit.
// - @param {Object} requestData - Parameters for this specific request.
// - @param {Object} headers - Headers for this request.
// - @param {Object} credentials - OAuth consumerkey and consumersecret.
// - @param {Object} logger - An object implementing the npm log levels.
// - @param {Function} callback - The callback to call with the response.
function post(endpointInfo, requestData, headers, credentials, logger, callback) {
	var hostInfo = {
		host: endpointInfo.host,
		port: endpointInfo.port
	};

	if (endpointInfo.authtype) {
		dispatchSecure(endpointInfo.url, 'POST', requestData, headers,
			endpointInfo.authtype, hostInfo, credentials, logger, callback);
	} else {
		dispatch(endpointInfo.url, 'POST', requestData, headers, hostInfo,
			credentials, logger, callback);
	}
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
function dispatchSecure(url, httpMethod, requestData, headers, authtype,
		hostInfo, credentials, logger, callback) {

	hostInfo.port = hostInfo.port || 443;

	var is2Legged = authtype === '2-legged';
	var token = is2Legged ? null : requestData.accesstoken;
	var secret = is2Legged ? null : requestData.accesssecret;
	var mergedHeaders = createHeaders(hostInfo.host, headers);
	var oauthClient = oauthHelper.createOAuthWrapper(credentials.consumerkey,
			credentials.consumersecret, mergedHeaders);
	var fullUrl;

	requestData = prepare(requestData, credentials.consumerkey);

	if (!is2Legged) {
		delete requestData.accesstoken;
		delete requestData.accesssecret;
	}

	if (httpMethod === 'GET') {
		logger.info('token: ' + token + ' secret: ' + secret);

		url = actionhelper.template(url, requestData);
		fullUrl = 'https://' + hostInfo.host + ':' + hostInfo.port + url;
		fullUrl = fullUrl + '?' + qs.stringify(requestData);
		logger.info(httpMethod + ': ' + fullUrl + ' (' + authtype + ' oauth)');
		logHeaders(logger, mergedHeaders);

		return oauthClient.get(fullUrl, token, secret,
			callbackWithDataAndResponse);
	}

	if (httpMethod === 'POST') {
		fullUrl = 'https://' + hostInfo.host + ':' + hostInfo.port + url;
		logger.info(httpMethod + ': ' + fullUrl + ' (' + authtype + ' oauth)');
		logger.info('DATA: ' + qs.stringify(requestData));
		logHeaders(logger, mergedHeaders);

		return oauthClient.post(fullUrl, token, secret, requestData,
			'application/x-www-form-urlencoded', callbackWithDataAndResponse);
	}

	function callbackWithDataAndResponse(err, data, response) {
		if (err) {
			logger.error(err);
			return callback(err);
		}

		return callback(null, data, response);
	}

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

	data = prepare(data, credentials.consumerkey);

	// Special case for track previews: we explicitly request to be given
	// the XML response back instead of a redirect to the track download.
	if (url.indexOf('track/preview') >= 0) {
		data.redirect = "false";
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
			response.setEncoding("utf8");
		}

		response.on("data", function bufferData(chunk) {
			responseBuffer += chunk;
		});

		response.on("end", function endResponse() {
			if (+response.statusCode >= 400) {
				return callback(new ApiHttpError(
					response.statusCode, responseBuffer));
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

		return callback(new Error('Error connecting to ' + url));
	});

	if (httpMethod === 'GET') {
		apiRequest.end();
	} else {
		apiRequest.end(data);
	}
}

module.exports.get = get;
module.exports.post = post;
module.exports.createHeaders = createHeaders;
module.exports.prepare = prepare;
module.exports.dispatch = dispatch;
module.exports.dispatchSecure = dispatchSecure;

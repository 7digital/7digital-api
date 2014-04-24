var util = require('util'),
	http = require('http'),
	ApiHttpError = require('./errors').ApiHttpError,
	cache = require('./cache'),
	querystring = require('querystring'),
	underscore = require('underscore'),
	helpers = require('./helpers'),
	oauthHelper = require('./oauth-helper'),
	USER_AGENT = 'Node.js HTTP Client';

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
			if (underscore.isDate(data[prop])) {
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
function createHeaders(host) {
	return {
		'host': host,
		'User-Agent' : USER_AGENT
	};
}

// Makes a GET request to the API.
//
// - @param {Object} endpointInfo - Generic metadata about the endpoint to hit.
// - @param {Object} requestData - Parameters for this specific request.
// - @param {Object} credentials - OAuth consumerkey and consumersecret.
// - @param {Object} logger - An object implementing the npm log levels.
// - @param {Object} theCache - A response cache.
// - @param {Function} callback - The callback to call with the response.
function get(endpointInfo, requestData, credentials, logger, theCache,
	callback) {

	var normalisedData = prepare(requestData, credentials.consumerkey),
		fullUrl = endpointInfo.url + '?' +
			querystring.stringify(normalisedData),
		cacheKey = cache.generateCacheKeyFromUrl(fullUrl),
		hostInfo = {
			host: endpointInfo.host,
			port: endpointInfo.port
		};

	theCache.get(cacheKey, function checkCacheResult(err, res) {
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
			dispatchSecure(endpointInfo.url, 'GET', requestData,
				endpointInfo.authtype, hostInfo, credentials, logger,
				cacheAndCallback);
		} else {
			dispatch(endpointInfo.url, 'GET', requestData, hostInfo,
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
	});
}

// Makes a POST request to the API.
//
// - @param {Object} endpointInfo - Generic metadata about the endpoint to hit.
// - @param {Object} requestData - Parameters for this specific request.
// - @param {Object} credentials - OAuth consumerkey and consumersecret.
// - @param {Object} logger - An object implementing the npm log levels.
// - @param {Function} callback - The callback to call with the response.
function post(endpointInfo, requestData, credentials, logger, callback) {
	var hostInfo = {
		host: endpointInfo.host,
		port: endpointInfo.port
	};

	if (endpointInfo.authtype) {
		dispatchSecure(endpointInfo.url, 'POST', requestData,
			endpointInfo.authtype, hostInfo, credentials, logger, callback);
	} else {
		dispatch(endpointInfo.url, 'POST', requestData, hostInfo, credentials,
			logger, callback);
	}
}

// Dispatches an oauth signed request to the API
//
// - @param {String} url - the path of the API url to request.
// - @param {String} httpMethod
// - @param {Object} requestData - hash of the parameters for the request.
// - @param {String} authType - OAuth request type: '2-legged' or '3-legged'
// - @param {Object} hostInfo - API host information
// - @param {Function} callback - The callback to call with the response.
function dispatchSecure(url, httpMethod, requestData, authtype, hostInfo,
		credentials, logger, callback) {

	var fullUrl = 'https://' + hostInfo.host + url,
		is2Legged = authtype === '2-legged',
		token = is2Legged ? null : requestData.accesstoken,
		secret = is2Legged ? null : requestData.accesssecret,
		oauthClient = oauthHelper.createOAuthWrapper(
			credentials.consumerkey, credentials.consumersecret);

	requestData = prepare(requestData, credentials.consumerkey);

	logger.info(httpMethod + ': ' + fullUrl + ' (' + authtype + ' oauth)');

	if (!is2Legged) {
		delete requestData.accesstoken;
		delete requestData.accesssecret;
	}

	if (httpMethod === 'GET') {
		logger.info('token: ' + token + ' secret: ' + secret);
		fullUrl = fullUrl + '?' + querystring.stringify(requestData);


		oauthClient.get(fullUrl, token, secret, function (err, data,
			response) {
			if (err) {
				logger.error(JSON.stringify(err));
				callback(err);
				return;
			}

			callback(null, data, response);
		});
	} else {
		oauthClient[httpMethod.toLowerCase()](fullUrl, token, secret,
			requestData, 'application/x-www-form-urlencoded',
			function (err, data, response) {

			if (err) {
				logger.error(err);
				callback(err);
				return;
			}

			callback(null, data, response);
		});
	}
	logger.info('DATA: ' + querystring.stringify(requestData));
}

// Dispatches requests to the API.  Serializes the data in keeping with the API
// specification and applies approriate HTTP headers.
//
// - @param {String} url - the URL on the API to make the request to.
// - @param {String} httpMethod
// - @param {Object} data - hash of the parameters for the request.
// - @param {Object} hostInfo - hash of host, port and version
// - @param {Object} credentials - hash of oauth consumer key and secret
// - @param {Object} logger - an object implementing the npm log levels
// - @param {Function} callback
function dispatch(url, httpMethod, data, hostInfo, credentials, logger,
	callback) {

	var apiRequest, headers, prop, hasErrored;

	data = prepare(data, credentials.consumerkey);

	// Special case for track previews: we explicitly request to be given
	// the XML response back instead of a redirect to the track download.
	if (url.indexOf('track/preview') >= 0) {
		data.redirect = "false";
	}

	if (httpMethod === 'GET') {
		url = url + '?' + querystring.stringify(data);
	}

	logger.info(util.format('%s: http://%s:%s%s', httpMethod,
		hostInfo.host, hostInfo.port, url));

	// Make the request
	apiRequest = http.request({
		method: httpMethod,
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
		headers: createHeaders(hostInfo.host)
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
				callback(null, responseBuffer, response);
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

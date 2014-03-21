var util = require('util'),
	http = require('http'),
	ApiError = require('./apierror'),
	cache = require('./cache'),
	querystring = require('querystring'),
	underscore = require('underscore'),
	helpers = require('./helpers'),
	oauthHelper = require('./oauth-helper'),
	crypto = require('crypto'),
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

// Generates the default headers for an API request
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
// @param {String} url - the URL on the API to make the GET request to.
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
function get(endpointInfo, requestData, credentials, logger, theCache,
	callback) {

	var normalisedData = prepare(requestData, credentials.consumerkey),
		fullUrl = endpointInfo.url + '?' + querystring.stringify(normalisedData),
		cacheKey = cache.generateCacheKeyFromUrl(fullUrl),
		hostInfo = {
			host: endpointInfo.host,
			port: endpointInfo.port
		};

	theCache.get(cacheKey, function (err, res) {
		if (err) {
			logger.error('Error checking cache for %s', cacheKey);
			logger.error(err);
			return callback(err);
		}

		if (res) {
			logger.info('Cache hit for %s', cacheKey);
			return callback(null, res);
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

		if (endpointInfo.authtype) {
			dispatchSecure(endpointInfo.url, 'GET', requestData,
				endpointInfo.authtype, hostInfo, credentials, logger,
				callback);
		} else {
			dispatch(endpointInfo.url, 'GET', requestData, hostInfo,
				credentials, logger, callback);
		}
	});
}

// Makes a POST request to the API.
//
// @param {String} url - the URL on the API to make the GET request to.
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
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
// @param {String} url - the URL on the API to make the request to.
// @param {String} httpMethod
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
function dispatchSecure(url, httpMethod, data, authtype, hostInfo, credentials,
						logger, callback) {
	var fullUrl = 'https://' + hostInfo.host + url,
		is2Legged = authtype === '2-legged',
		token = is2Legged ? null : data.accesstoken,
		secret = is2Legged ? null : data.accesssecret,
		oauthClient = oauthHelper.createOAuthWrapper(
			credentials.consumerkey, credentials.consumersecret)
		;

	data = prepare(data, credentials.consumerkey);

	logger.info(httpMethod + ': ' + fullUrl + ' (' + authtype + ' oauth)');

	if (!is2Legged) {
		delete data.accesstoken;
		delete data.accesssecret;
	}

	if (httpMethod === 'GET') {
		logger.info('token: ' + token + ' secret: ' + secret);
		fullUrl = fullUrl + '?' + querystring.stringify(data);


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
			data, 'application/x-www-form-urlencoded', function (err, data,
				response) {
			if (err) {
				logger.error(err);
				callback(err);
				return;
			}

			callback(null, data, response);
		});
	}
	logger.info('DATA: ' + querystring.stringify(data));
}

// Dispatches requests to the API.  Serializes the data in keeping with the API
// specification and applies approriate HTTP headers.
//
// @param {String} url - the URL on the API to make the request to.
// @param {String} httpMethod
// @param {Object} data - hash of the parameters for the request.
// @param {Object} hostInfo - hash of host, port and version
// @param {Object} credentials - hash of oauth consumer key and secret
// @param {Object} logger - an object implementing the npm log levels
// @param {Function} callback
function dispatch(url, httpMethod, data, hostInfo, credentials, logger,
	callback) {

	var apiRequest, headers, prop;

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
	apiRequest = http.request({
		method: httpMethod,
		hostname: hostInfo.host,
		path: url,
		port: hostInfo.port,
		headers: createHeaders(hostInfo.host)
	}, function handleResponse(response) {
		var responseBuffer = '';

		response.setEncoding("utf8");
		response.on("data", function bufferData(chunk) {
			responseBuffer += chunk;
		});

		response.on("end", function endResponse() {
			if (+response.statusCode > 400) {
				return callback(new ApiError(
					response.statusCode, responseBuffer));
			}
			callback(null, responseBuffer);
		});
	});

	apiRequest.on('error', function logError(data) {
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

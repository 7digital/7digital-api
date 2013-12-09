var http = require('http'),
	ApiError = require('./apierror'),
	querystring = require('querystring'),
	underscore = require('underscore'),
	helpers = require('./helpers'),
	oauthHelper = require('./oauth-helper'),
	crypto = require('crypto'),
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
// - *cache* - An object with two methods `get` and `set` which can be used to
//             cache api responses.
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
	this.cache = options.cache;

	if (options.authtype === '2-legged' || options.authtype === '3-legged') {
		this.oauthClient = oauthHelper.createOAuthWrapper(this.consumerkey,
			this.consumersecret);
	} else {
		this.client = http.createClient(80, this.host);
	}
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

	return data;
};

Request.prototype.generateCacheKey = function generateCacheKey(url) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(url);

	return '7digital-api:' + md5sum.digest('hex');
};


// Determines the path for a given action on a resource
//
// @param {String} resource
// @param {String} action
Request.prototype.formatPath = function (resource, action) {
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

Request.prototype.parseMaxAge = function parseMaxAge(response) {
	var cacheControl = response.headers['cache-control'],
		maxAge;
	if (!cacheControl) {
		return false;
	}

	maxAge = /max-age=(\d+)/.exec(cacheControl);
	if (!maxAge) {
		return false;
	}

	return Number(maxAge[1]);
};

// Makes a GET request to the API.
//
// @param {String} url - the URL on the API to make the GET request to.
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
Request.prototype.get = function (url, data, callback) {
	var normalisedData = this.prepare(data),
		fullUrl = url + '?' + querystring.stringify(normalisedData),
		cacheKey = this.generateCacheKey(fullUrl),
		cache = this.cache,
		self = this;

	cache.get(cacheKey, function (err, res) {
		if (err) {
			self.logger.error('Error checking cache for %s', cacheKey);
			self.logger.error(err);
			return callback(err);
		}

		if (res) {
			self.logger.info('Cache hit for %s', cacheKey);
			return callback(null, res);
		}

		function cacheAndCallback(err, data, response) {
			var ttl = self.parseMaxAge(response);

			if (ttl) {
				cache.set(cacheKey, data, ttl, function callbackWithResult(err) {
					if (err) {
						self.logger.error('Error setting %s to cache', cacheKey);
						self.logger.error(err);
						return callback(err);
					}

					self.logger.info('Cached %s for %s seconds', cacheKey, ttl);
					return callback(null, data, response);
				});
			} else {
				return callback(null, data, response);
			}
		}

		if (self.authtype === '2-legged' || self.authtype === '3-legged') {
			self.makeSecureRequest(url, 'GET', data, cacheAndCallback);
		} else {
			self.makeRequest(url, 'GET', data, cacheAndCallback);
		}
	});
};

// Makes a POST request to the API.
//
// @param {String} url - the URL on the API to make the GET request to.
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
Request.prototype.post = function (url, data, callback) {
	if (this.authtype === '2-legged' || this.authtype === '3-legged') {
		this.makeSecureRequest(url, 'POST', data, callback);
	} else {
		this.makeRequest(url, 'POST', data, callback);
	}
};

// Dispatches an oauth signed request to the API
//
// @param {String} url - the URL on the API to make the request to.
// @param {String} httpMethod
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
Request.prototype.makeSecureRequest = function (url, httpMethod, data,
												callback) {
	var self = this,
		fullUrl = 'https://' + this.host + url,
		is2Legged = this.authtype === '2-legged',
		token = is2Legged ? null : data.accesstoken,
		secret = is2Legged ? null : data.accesssecret;

	data = this.prepare(data);

	this.logger.info(httpMethod + ': ' + fullUrl + ' (' +
		this.authtype + ' oauth)');

	if (!is2Legged) {
		delete data.accesstoken;
		delete data.accesssecret;
	}

	if (httpMethod === 'GET') {
		console.log('token: ' + token + ' secret: ' + secret);
		fullUrl = fullUrl + '?' + querystring.stringify(data);
		this.oauthClient.get(fullUrl, token, secret, function (err, data,
			response) {
			if (err) {
				self.logger.error(JSON.stringify(err));
				callback(err);
				return;
			}

			callback(null, data, response);
		});
	} else {
		this.oauthClient[httpMethod.toLowerCase()](fullUrl, token, secret,
			data, 'application/x-www-form-urlencoded', function (err, data,
				response) {
			if (err) {
				self.logger.error(err);
				return;
			}

			callback(null, data, response);
		});
	}
	this.logger.info('DATA: ' + querystring.stringify(data));
};

// Dispatches requests to the API.  Serializes the data in keeping with the API
// specification and applies approriate HTTP headers.
//
// @param {String} url - the URL on the API to make the request to.
// @param {String} httpMethod
// @param {Object} data - hash of the parameters for the request.
// @param {Function} callback
Request.prototype.makeRequest = function (url, httpMethod, data, callback) {
	var apiRequest, headers, prop, self = this;

	data = this.prepare(data);

	// Special case for track previews: we explicitly request to be given
	// the XML response back instead of a redirect to the track download.
	if (url.indexOf('track/preview') >= 0) {
		data.redirect = "false";
	}

	if (httpMethod === 'GET') {
		url = url + '?' + querystring.stringify(data);
	}

	this.logger.info(httpMethod + ': ' + url);
	apiRequest = this.client.request(httpMethod, url, this.createHeaders());

	apiRequest.on('response', function handleResponse(response) {
		var responseBuffer = '';

		response.setEncoding("utf8");
		response.on("data", function bufferData(chunk) {
			responseBuffer += chunk;
		});

		response.on("end", function endResponse() {
			if (+response.statusCode > 400) {
				return callback(new ApiError(response.statusCode, responseBuffer));
			}
			callback(null, responseBuffer, response);
		});
	});

	apiRequest.on('error', function logError(data) {
		self.logger.info('Error fetching [' + url + ']. Body:\n' + data);
		return callback(new Error('Error connecting to ' + url));
	});

	if (httpMethod === 'GET') {
		apiRequest.end();
	} else {
		apiRequest.end(data);
	}
};

module.exports = Request;

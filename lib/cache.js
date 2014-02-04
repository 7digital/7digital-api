var crypto = require('crypto');

// Generates a cache key for a request based on the full URL used to make the
// request
//
// - @param {String} url - The full url of the request
// - @return {String} - The cache key
function generateCacheKeyFromUrl(url) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(url);

	return '7digital-api:' + md5sum.digest('hex');
}

// Parses the max-age value from the cache-control header in the response
//
// - @param {Response} HttpResponse - The response to parse
// - @return {Number|Boolean} - Either the value of the max-age property of the
// Cache-Control header in the response or false if it doesn't exist.
function parseMaxAgeHeader(response) {
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
}

module.exports.generateCacheKeyFromUrl = generateCacheKeyFromUrl;
module.exports.parseMaxAgeHeader = parseMaxAgeHeader;

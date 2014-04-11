var util = require('util');

// ApiError
//
// Creates a new APIError supplied to callbacks when an error response is
// received.
//
// @constructor
// @param {Number} statusCode - The HTTP status code of the request.
// @param {String} response - (Optional) The response body.
function ApiError(statusCode, response) {
	this.name = "ApiError";
	this.statusCode = statusCode;
	this.response = response;
	this.message = response
		|| util.format('Unexpected %s status code', statusCode);
}

util.inherits(ApiError, Error);

module.exports = ApiError;

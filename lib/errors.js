var util = require('util');

// ApiHttpError
//
// Creates a new ApiHttpError supplied to callbacks when an error response is
// received at transport level.
//
// - @constructor
// - @param {Number} statusCode - The HTTP status code of the request.
// - @param {String} response - (Optional) The response body.
function ApiHttpError(statusCode, response) {
	this.name = "ApiHttpError";
	this.statusCode = statusCode;
	this.response = response;
	this.message = response
		|| util.format('Unexpected %s status code', statusCode);
	Error.captureStackTrace(this, ApiHttpError);
}

util.inherits(ApiHttpError, Error);

// ApiParseError
//
// Creates a new ApiParseError supplied to callbacks when an invalid or
// unexpected response is received.
//
// - @constructor
// - @param {String} parseErrorMessage - Custom error message
//                   describing the nature of the parse error.
// - @param {String} response - The response body string.
function ApiParseError(parseErrorMessage, response) {
	this.name = "ApiParseError";
	this.response = response;
	this.message = parseErrorMessage;
	Error.captureStackTrace(this, ApiParseError);
}

util.inherits(ApiParseError, Error);

// ApiError
//
// Creates a new ApiError supplied to callbacks when a valid error response is
// received.
//
// - @constructor
// - @param {Object} errorResponse - The parsed API error response
function ApiError(errorResponse) {
	this.name = "ApiError";
	this.message = errorResponse.errorMessage;
	this.code = errorResponse.code;
	this.response = errorResponse;
	Error.captureStackTrace(this, ApiError);
}

util.inherits(ApiError, Error);

module.exports = {
	ApiHttpError: ApiHttpError,
	ApiParseError: ApiParseError,
	ApiError: ApiError
};

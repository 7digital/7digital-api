'use strict';

var util = require('util');

// IdendifiedApiError
//
// Marker class for errors that have been identified as known errors
// communicating with the API.  You should *not* instantiate these
// directly.
//
// - @constructor
function IdentifiedApiError(){}
util.inherits(IdentifiedApiError, Error);

// ApiHttpError
//
// Creates a new ApiHttpError supplied to callbacks when an error response is
// received at transport level.
//
// - @constructor
// - @param {Number} statusCode - The HTTP status code of the request.
// - @param {String} response - (Optional) The response body.
// - @param {String} message - (Optional) The message
function ApiHttpError(statusCode, response, message) {
	this.name = "ApiHttpError";
	this.statusCode = statusCode;
	this.response = response;
	this.message = message || response
		|| util.format('Unexpected %s status code', statusCode);

	if (Error.captureStackTrace
		&& typeof Error.captureStackTrace === 'function') {
		Error.captureStackTrace(this, ApiHttpError);
	}
}

util.inherits(ApiHttpError, IdentifiedApiError);

// ApiParseError
//
// Creates a new ApiParseError supplied to callbacks when an invalid or
// unexpected response is received.
//
// - @constructor
// - @param {String} parseErrorMessage - Custom error message
// describing the nature of the parse error.
// - @param {String} response - The response body string.
function ApiParseError(parseErrorMessage, response) {
	this.name = "ApiParseError";
	this.response = response;
	this.message = parseErrorMessage;

	if (Error.captureStackTrace
		&& typeof Error.captureStackTrace === 'function') {
		Error.captureStackTrace(this, ApiParseError);
	}
}

util.inherits(ApiParseError, IdentifiedApiError);

// OAuthError
//
// Creates a new ApiError supplied to callbacks when a valid error response is
// received.
//
// - @constructor
// - @param {Object} errorResponse - The parsed API error response
// - @param {Object} message - The message
function OAuthError(errorResponse, message) {
	this.name = "OAuthError";
	this.message = message || errorResponse.errorMessage;
	this.code = errorResponse.code;
	this.response = errorResponse;

	if (Error.captureStackTrace
		&& typeof Error.captureStackTrace === 'function') {
		Error.captureStackTrace(this, OAuthError);
	}
}

util.inherits(ApiError, IdentifiedApiError);

// ApiError
//
// Creates a new ApiError supplied to callbacks when a valid error response is
// received.
//
// - @constructor
// - @param {Object} errorResponse - The parsed API error response
// - @param {Object} message - The message
function ApiError(errorResponse, message) {
	this.name = "ApiError";
	this.message = message || errorResponse.errorMessage;
	this.code = errorResponse.code;
	this.response = errorResponse;

	if (Error.captureStackTrace
		&& typeof Error.captureStackTrace === 'function') {
		Error.captureStackTrace(this, ApiError);
	}
}

util.inherits(ApiError, IdentifiedApiError);

module.exports = {
	ApiHttpError: ApiHttpError,
	ApiParseError: ApiParseError,
	OAuthError: OAuthError,
	ApiError: ApiError,
	IdentifiedApiError: IdentifiedApiError
};

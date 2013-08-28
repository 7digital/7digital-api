var util = require('util');

function ApiError(statusCode, response) {
	this.name = "ApiError";
	this.statusCode = statusCode;
	this.response = response;
}

util.inherits(ApiError, Error);

module.exports = ApiError;

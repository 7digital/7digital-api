var util = require('util');

function ApiError(statusCode, response) {
	this.name = "ApiError";
	this.statusCode = statusCode;
	this.response = response;
	this.message = response && response.body
		|| util.format('Unexpected %s status code', statusCode);
}

util.inherits(ApiError, Error);

module.exports = ApiError;

'use strict';

var assert = require('chai').assert;
var ApiHttpError = require('../lib/errors').ApiHttpError;
var ApiParseError = require('../lib/errors').ApiParseError;
var ApiError = require('../lib/errors').ApiError;

describe('API HTTP Error', function() {

	it('uses the response body as the message', function() {
		var msg = 'You have exceeded your daily request limit of 4000';
		var err = new ApiHttpError(401, msg);

		assert.equal(err.message, msg);
	});

	it('uses the status code as the message when the body is empty',
		function() {

		var err = new ApiHttpError(401, '');

		assert.equal(err.message, 'Unexpected 401 status code');
	});

	it('uses the status code as the message when the response is not defined',
		function() {

		var err = new ApiHttpError(401);

		assert.equal(err.message, 'Unexpected 401 status code');
	});

	it('has a stack trace', function() {
		var err = new ApiHttpError(401);

		assert(err.stack);
	});
});

describe('API Parse Error', function () {

	it('uses the passed message as the message', function () {
		var err = new ApiParseError('my message', 'my response');

		assert.equal(err.message, 'my message');
	});

	it('sets the passed raw response as a property', function () {
		var err = new ApiParseError('my message', 'my raw response');

		assert.equal(err.response, 'my raw response');
	});

	it('has a stack trace', function() {
		var err = new ApiParseError(401);

		assert(err.stack);
	});
});

describe('Api Response Error', function () {

	it('uses error message returned from the api as the message', function () {
		var err = new ApiError({
			errorMessage: 'api error message',
			code: 1234
		});

		assert.equal(err.message, 'api error message');
	});

	it('sets the api response code as a property', function () {
		var err = new ApiError({
			errorMessage: 'api error message',
			code: 1234
		});

		assert.equal(err.code, 1234);
	});

	it('has a stack trace', function() {
		var err = new ApiError(401);

		assert(err.stack);
	});
});


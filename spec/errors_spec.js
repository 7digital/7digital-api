var expect = require('chai').expect;
var ApiHttpError = require('../lib/errors').ApiHttpError;
var ApiParseError = require('../lib/errors').ApiParseError;
var ApiError = require('../lib/errors').ApiError;

describe('API HTTP Error', function() {

	it('should use the response body as the message', function() {
		var msg = 'You have exceeded your daily request limit of 4000';
		var err = new ApiHttpError(401, msg);

		expect(err.message).to.equal(msg);
	});

	it('should use the status code as the message when the body is empty', function() {
		var err = new ApiHttpError(401, '');

		expect(err.message).to.equal('Unexpected 401 status code');
	});

	it('should use the status code as the message when the response is not defined', function() {
		var err = new ApiHttpError(401);

		expect(err.message).to.equal('Unexpected 401 status code');
	});

	it('should have a stack trace', function() {
		var err = new ApiHttpError(401);

		expect(err.stack).to.not.be.undefined;
	});
});

describe('API Parse Error', function () {

	it('should use the passed message as the message', function () {
		var err = new ApiParseError('my message', 'my response');

		expect(err.message).to.equal('my message');
	});

	it('should set the passed raw response as a property', function () {
		var err = new ApiParseError('my message', 'my raw response');

		expect(err.response).to.equal('my raw response');
	});

	it('should have a stack trace', function() {
		var err = new ApiParseError(401);

		expect(err.stack).to.not.be.undefined;
	});
});

describe('Api Response Error', function () {

	it('should use the error message returned from the api as the message', function () {
		var err = new ApiError({
			errorMessage: 'api error message',
			code: 1234
		});

		expect(err.message).to.equal('api error message');
	});

	it('should set the api response code as a property', function () {
		var err = new ApiError({
			errorMessage: 'api error message',
			code: 1234
		});

		expect(err.code).to.equal(1234);
	});

	it('should have a stack trace', function() {
		var err = new ApiError(401);

		expect(err.stack).to.not.be.undefined;
	});
});


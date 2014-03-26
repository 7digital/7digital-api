var expect = require('chai').expect;
var ApiError = require('../lib/apierror');

describe('API Error', function() {

	it('should use the response body as the message', function() {
		var msg = 'You have exceeded your daily request limit of 4000';
		var err = new ApiError(401, msg);

		expect(err.message).to.equal(msg);
	});

	it('should use the status code as the message when the body is empty', function() {
		var err = new ApiError(401, '');

		expect(err.message).to.equal('Unexpected 401 status code');
	});

	it('should use the status code as the message when the response is not defined', function() {
		var err = new ApiError(401);

		expect(err.message).to.equal('Unexpected 401 status code');
	});
});

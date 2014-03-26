var expect = require('chai').expect;
var sinon = require('sinon');

describe('logger', function() {
	var log = require('../lib/logger');
	var originalConsole;

	it('should have the npm log levels', function() {
		expect(log.silly).to.exist;
		expect(log.verbose).to.exist;
		expect(log.info).to.exist;
		expect(log.http).to.exist;
		expect(log.warn).to.exist;
		expect(log.error).to.exist;
	});

	// Cant clobber console - mocha has already clobbered it
	xit('should concatenate first argument and prefix with remaining', 
		function () {
		log.error('foo %s', {}, bar); // prints "foo [object Object] 23"
	});
});

'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');

describe('logger', function() {
	var log = require('../lib/logger');
	var originalConsole;

	it('should have the npm log levels', function() {
		assert(log.silly);
		assert(log.verbose);
		assert(log.info);
		assert(log.http);
		assert(log.warn);
		assert(log.error);
	});

	// Cant clobber console - mocha has already clobbered it
	xit('should concatenate first argument and prefix with remaining',
		function () {
		log.error('foo %s', {}, 23); // prints "foo [object Object] 23"
	});
});

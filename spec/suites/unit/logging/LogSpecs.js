var Logger = require('../../../../lib/logging').Logger;

describe('Log with debug', function() {

	it('should log to the console', function() {
		var logger = new Logger({ debug: true });
		spyOn(console, 'log');
		
		logger.log('foo');
		expect(console.log).toHaveBeenCalled();
	});

});

describe('Log without debug',function() {

	it('should not log to the console', function() {
		var logger = new Logger({ debug: false });
		spyOn(console, 'log');

		logger.log('foo');
		expect(console.log).not.toHaveBeenCalled();
	});

});

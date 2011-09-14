var ResponseParser = require('../lib/responseparser'),
	winston = require('winston'),
	fs = require('fs'),
	path = require('path');

describe('responseparser', function() {
	var parser = new ResponseParser({
		format: 'xml',
		logger: new winston.Logger({ transports: [] })
	});

	it('should return xml when format is xml', function() {
		var callbackSpy = jasmine.createSpy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');
		parser.parse(callbackSpy, null, xml);
		expect(callbackSpy).toHaveBeenCalled();
		expect(callbackSpy).toHaveBeenCalledWith(null, xml);
	});

	it('should return xml when format is XML', function() {
		var callbackSpy = jasmine.createSpy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');

		parser.format = 'XML';
		parser.parse(callbackSpy, null, xml);
		expect(callbackSpy).toHaveBeenCalled();
		expect(callbackSpy).toHaveBeenCalledWith(null, xml);
	});

	it('should return javascript object when format is not xml', function() {
		var callbackSpy = jasmine.createSpy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');

		parser.format = 'js';
		parser.parse(callbackSpy, null, xml);
		expect(callbackSpy).toHaveBeenCalled();
		expect(typeof callbackSpy.mostRecentCall.args[1]).toEqual('object');
	});
});

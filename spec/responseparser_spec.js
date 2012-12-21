var ResponseParser = require('../lib/responseparser'),
	winston = require('winston'),
	fs = require('fs'),
	path = require('path');

describe('responseparser', function() {
	var parser = new ResponseParser({
		format: 'xml',
		logger: new winston.Logger({ transports: [] })
	});

	beforeEach(function() {
		this.addMatchers({
			toBeAnArray: function() {
				return this.actual.constructor.toString().indexOf('Array') !== -1;
			}
		})
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

	it('should normalise single resource responses into an array', function() {
		var callbackSpy = jasmine.createSpy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');

		parser.format = 'js';
		parser.parse(callbackSpy, null, xml);
		expect(callbackSpy).toHaveBeenCalled();
		var response = callbackSpy.mostRecentCall.args[1].response;
		console.log(response);
		expect(response.tracks[0].track).toBeAnArray();
	});
  //  Note that basket items are one level deeper than other arrays, hence
  //  the separate test.
	it("should normalise basket items into an array", function () {
		var callbackSpy = jasmine.createSpy()
		xml = fs.readFileSync(path.join(__dirname + 
								"/responses/basket-additem.xml"), "utf8");
		parser.format = "js";
		parser.parse(callbackSpy, null, xml);
		expect(callbackSpy).toHaveBeenCalled();
		response = callbackSpy.mostRecentCall.args[1].response;
		console.log(response);
		expect(response.basket[0].basketItems).toBeAnArray();
	});
});

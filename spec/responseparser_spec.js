var expect = require('chai').expect;
var ResponseParser = require('../lib/responseparser'),
	winston = require('winston'),
	fs = require('fs'),
	path = require('path'),
	sinon = require('sinon');

describe('responseparser', function() {
	var parser = new ResponseParser({
		format: 'xml',
		logger: new winston.Logger({ transports: [] })
	});

	it('should return xml when format is xml', function() {
		var callbackSpy = sinon.spy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');
		parser.parse(callbackSpy, null, xml);
		expect(callbackSpy.calledOnce);
		expect(callbackSpy.calledWith(null, xml));
	});

	it('should return xml when format is XML', function() {
		var callbackSpy = sinon.spy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');

		parser.format = 'XML';
		parser.parse(callbackSpy, null, xml);
		expect(callbackSpy.calledOnce);
		expect(callbackSpy.calledWith(null, xml));
	});

	it('should return javascript object when format is not xml', function() {
		var callbackSpy = sinon.spy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');

		parser.format = 'js';
		parser.parse(callbackSpy, null, xml);
		expect(callbackSpy.calledOnce);
		expect(typeof callbackSpy.lastCall.args[1]).to.equal('object');
	});

	it('should callback with the error when the status is error', function () {
		var callbackSpy = sinon.spy(),
			xml = fs.readFileSync(
				path.join(__dirname, 'responses', 'release-not-found.xml'), 
				'utf-8');

		parser.format = 'js';
		parser.parse(callbackSpy, null, xml)
		expect(callbackSpy.calledOnce)
		var error = callbackSpy.lastCall.args[0];
		var response = callbackSpy.lastCall.args[1];
		expect(error).to.not.equal(undefined);
		expect(response).to.equal(undefined);
		expect(error.code).to.equal('2001');
		expect(error.errorMessage).to.equal("Release not found");
	});

	it('should normalise single resource responses into an array', function() {
		var callbackSpy = sinon.spy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');

		parser.format = 'js';
		parser.parse(callbackSpy, null, xml);
		expect(callbackSpy.calledOnce)
		var response = callbackSpy.lastCall.args[1];
		expect(response.tracks.track).to.be.instanceOf(Array);
	});

	//  Note that basket items are one level deeper than other arrays, hence
	//  the separate test.
	it("should normalise basket items into an array", function () {
		var callbackSpy = sinon.spy()
		xml = fs.readFileSync(path.join(__dirname + 
								"/responses/basket-additem.xml"), "utf8");
		parser.format = "js";
		parser.parse(callbackSpy, null, xml);
		expect(callbackSpy.calledOnce)
		response = callbackSpy.lastCall.args[1];
		expect(response.basket.basketItems).to.be.instanceOf(Array);
	});
});

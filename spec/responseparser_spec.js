var expect = require('chai').expect,
	parser = require('../lib/responseparser'),
	fs = require('fs'),
	path = require('path'),
	sinon = require('sinon'),
	ApiParseError = require('../lib/errors').ApiParseError,
	ApiError = require('../lib/errors').ApiError;

describe('responseparser', function() {

	function createOptsWithFormat(format) {
		return {
			format: format,
			logger: { silly: function () {} }
		};
	}

	it('should return xml when format is xml', function() {
		var callbackSpy = sinon.spy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');
		parser.parse(xml, createOptsWithFormat('XML'), callbackSpy);
		expect(callbackSpy.calledOnce);
		expect(callbackSpy.calledWith(null, xml));
	});

	it('should return javascript object when format is not xml', function() {
		var callbackSpy = sinon.spy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		expect(callbackSpy.calledOnce);
		expect(typeof callbackSpy.lastCall.args[1]).to.equal('object');
	});

	it('should return parse error when response format is unexpected', function () {
		var callbackSpy = sinon.spy(),
		xml = 'some really rubbish xml';

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		expect(callbackSpy.calledOnce);
		expect(callbackSpy.lastCall.args[0]).to.be.an.instanceOf(
			ApiParseError);
	});

	it('should remove xml cruft', function() {
		var parsed, callbackSpy = sinon.spy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		expect(callbackSpy.calledOnce);
		parsed = callbackSpy.lastCall.args[1];
		expect(typeof callbackSpy.lastCall.args[1]).to.equal('object');
		expect(parsed['xmlns:xsi']).to.be.undefined;
		expect(parsed['xmlns:xsd']).to.be.undefined;
		expect(parsed['xsi:noNamespaceSchemaLocation:']).to.be.undefined;
	});

	it('should callback with the error when the status is error', function () {
		var callbackSpy = sinon.spy(),
			xml = fs.readFileSync(
				path.join(__dirname, 'responses', 'release-not-found.xml'),
				'utf-8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		expect(callbackSpy.calledOnce);
		var error = callbackSpy.lastCall.args[0];
		var response = callbackSpy.lastCall.args[1];
		expect(error).to.not.equal(undefined);
		expect(response).to.equal(undefined);
		expect(error).to.be.instanceOf(ApiError);
		expect(error.code).to.equal('2001');
		expect(error.message).to.equal("Release not found");
	});

	it('should normalise single resource responses into an array', function() {
		var callbackSpy = sinon.spy(),
			xml = fs.readFileSync(
				path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'),
					'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		expect(callbackSpy.calledOnce);
		var response = callbackSpy.lastCall.args[1];
		expect(response.tracks.track).to.be.instanceOf(Array);
	});

	//  Note that basket items are one level deeper than other arrays, hence
	//  the separate test.
	it("should normalise basket items into an array", function () {
		var response;
		var callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
								"/responses/basket-additem.xml"), "utf8");
		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		expect(callbackSpy.calledOnce);
		response = callbackSpy.lastCall.args[1];
		expect(response.basket.basketItems).to.be.instanceOf(Array);
	});

	it('should give the payment card text node a name', function () {
		var callbackSpy = sinon.spy(),
			xml = fs.readFileSync(path.join(__dirname +
								"/responses/payment-card-type.xml"), "utf8");
		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		expect(callbackSpy.calledOnce);

		var response = callbackSpy.lastCall.args[1];
		expect(response.cardTypes.cardType).to.be.instanceOf(Array);
		expect(response.cardTypes.cardType[0].name).to.equal('Mastercard');
		expect(response.cardTypes.cardType[0].id).to.equal('MASTERCARD');
	});
});

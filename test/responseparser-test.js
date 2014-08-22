'use strict';

var assert = require('chai').assert;
var parser = require('../lib/responseparser');
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var ApiParseError = require('../lib/errors').ApiParseError;
var ApiError = require('../lib/errors').ApiError;

describe('responseparser', function() {

	function createOptsWithFormat(format) {
		return {
			format: format,
			logger: { silly: function () {} }
		};
	}

	it('returns xml when format is xml', function() {
		var callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
				'/responses/release-tracks-singletrack.xml'), 'utf8');
		parser.parse(xml, createOptsWithFormat('XML'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert(callbackSpy.calledWith(null, xml));
	});

	it('returns javascript object when format is not xml', function() {
		var callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
			'/responses/release-tracks-singletrack.xml'), 'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert.equal(typeof callbackSpy.lastCall.args[1], 'object');
	});

	it('returns parse error when response format is unexpected', function () {
		var callbackSpy = sinon.spy();
		var xml = 'some really rubbish xml';

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert.instanceOf(callbackSpy.lastCall.args[0], ApiParseError);
	});

	it('removes xml cruft', function () {
		var parsed, callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
					'/responses/release-tracks-singletrack.xml'), 'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		parsed = callbackSpy.lastCall.args[1];
		assert.equal(typeof callbackSpy.lastCall.args[1], 'object');
		assert.isUndefined(parsed['xmlns:xsi']);
		assert.isUndefined(parsed['xmlns:xsd']);
		assert.isUndefined(parsed['xsi:noNamespaceSchemaLocation:']);
	});

	it('calls back with the error when the status is error', function () {
		var error, response, callbackSpy = sinon.spy();
		var xml = fs.readFileSync(
				path.join(__dirname, 'responses', 'release-not-found.xml'),
				'utf-8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		error = callbackSpy.lastCall.args[0];
		response = callbackSpy.lastCall.args[1];
		assert(error);
		assert.isUndefined(response);
		assert.instanceOf(error, ApiError);
		assert.equal(error.code, '2001');
		assert.equal(error.message, 'Release not found');
	});

	it('normalises single resource responses into an array', function() {
		var response, callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
			'/responses/release-tracks-singletrack.xml'), 'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		response = callbackSpy.lastCall.args[1];
		assert.instanceOf(response.tracks.track, Array);
	});

	it('normalises single locker responses into an array', function () {
		var response, callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
			'/responses/locker-single-release-and-track.xml'), 'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		response = callbackSpy.lastCall.args[1];
		var lockerReleaseArray = response.locker.lockerReleases.lockerRelease;
		assert.instanceOf(lockerReleaseArray, Array);
		var lockerTrackArray = lockerReleaseArray[0].lockerTracks.lockerTrack;
		assert.instanceOf(lockerTrackArray, Array);
	});

	it('normalises release formats', function () {
		var response, callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
			'/responses/release-single-format.xml'), 'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		response = callbackSpy.lastCall.args[1];
		assert.instanceOf(response.release.formats.format, Array);
	});

	it('normalises editorial list items', function () {
		var response, callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
			'/responses/list-single.xml'), 'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		response = callbackSpy.lastCall.args[1];
		assert.instanceOf(response.list.listItems.listItem, Array);
	});

	it('leaves list items alone if they are already arrays', function () {
		var response, callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
			'/responses/list-multiple.xml'), 'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		response = callbackSpy.lastCall.args[1];
		assert.instanceOf(response.list.listItems.listItem, Array);
	});

	//  Note that basket items are one level deeper than other arrays, hence
	//  the separate test.
	it('normalises basket items into an array', function () {
		var response;
		var callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
								'/responses/basket-additem.xml'), 'utf8');
		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		response = callbackSpy.lastCall.args[1];
		assert.instanceOf(response.basket.basketItems, Array);
	});

	it('handles the empty basket case', function () {
		var response;
		var callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
								'/responses/basket-empty.xml'), 'utf8');
		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		response = callbackSpy.lastCall.args[1];
		assert.instanceOf(response.basket.basketItems, Array);
		assert.lengthOf(response.basket.basketItems, 0);
	});

	it('names the payment card text node', function () {
		var response, callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
			'/responses/payment-card-type.xml'), 'utf8');
		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);

		response = callbackSpy.lastCall.args[1];
		assert.instanceOf(response.cardTypes.cardType, Array);
		assert.equal(response.cardTypes.cardType[0].name, 'Mastercard');
		assert.equal(response.cardTypes.cardType[0].id, 'MASTERCARD');
	});

});

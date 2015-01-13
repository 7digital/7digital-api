'use strict';

var assert = require('chai').assert;
var parser = require('../lib/responseparser');
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var ApiParseError = require('../lib/errors').ApiParseError;
var ApiError = require('../lib/errors').ApiError;

describe('when parsing responses', function () {

	function createOptsWithFormat(format) {
		return {
			format: format,
			contentType: 'application/xml',
			url: '/foo',
			logger: { silly: function () {} }
		};
	}

	it('calls back with xml when format is xml', function () {
		var callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
				'/responses/release-tracks-singletrack.xml'), 'utf8');
		parser.parse(xml, createOptsWithFormat('XML'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert(callbackSpy.calledWith(null, xml));
	});

	it('calls back with javascript object when format is not xml', function () {
		var callbackSpy = sinon.spy();
		var xml = fs.readFileSync(path.join(__dirname +
			'/responses/release-tracks-singletrack.xml'), 'utf8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert.equal(typeof callbackSpy.lastCall.args[1], 'object');
	});

	it('calls back with parse error when response format is unexpected', function () {
		var callbackSpy = sinon.spy();
		var xml = 'some really rubbish xml';

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert.instanceOf(callbackSpy.lastCall.args[0], ApiParseError);
		assert.strictEqual(callbackSpy.lastCall.args[0].message,
			'Unparsable api response from: /foo');
	});

	it('calls back with parse error when response is empty', function () {
		var callbackSpy = sinon.spy();

		parser.parse('', createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert.instanceOf(callbackSpy.lastCall.args[0], ApiParseError);
		assert.strictEqual(callbackSpy.lastCall.args[0].message,
			'Empty response from: /foo');
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
		assert.equal(error.message, 'Release not found: /foo');
	});

	it('assumes xml when no content type', function () {
		var callbackSpy = sinon.spy();
		var opts = createOptsWithFormat('json');
		var xml = fs.readFileSync(path.join(__dirname +
				'/responses/release-tracks-singletrack.xml'), 'utf8');
		delete opts.contentType;
		parser.parse(xml, opts, callbackSpy);
		assert(callbackSpy.calledOnce);
		assert.equal(typeof callbackSpy.lastCall.args[1], 'object');
	});
});

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
			statusCode: 123,
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
		assert.lengthOf(callbackSpy.lastCall.args, 1);

		var err = callbackSpy.lastCall.args[0];
		assert.instanceOf(err, ApiParseError);
		assert.strictEqual(err.message, 'Unparsable api response from: /foo');
		assert.strictEqual(err.response, xml);
		assert.strictEqual(err.statusCode, 123);
	});

	it('calls back with parse error when response is empty', function () {
		var callbackSpy = sinon.spy();

		parser.parse('', createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert.lengthOf(callbackSpy.lastCall.args, 1);

		var err = callbackSpy.lastCall.args[0];
		assert.instanceOf(err, ApiParseError);
		assert.strictEqual(err.message, 'Empty response from: /foo');
		assert.strictEqual(err.response, '');
		assert.strictEqual(err.statusCode, 123);
	});

	it('calls back with parse error when response is missing <response>', function () {
		var callbackSpy = sinon.spy();
		var xml = '<something-unexpected />';

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert.lengthOf(callbackSpy.lastCall.args, 1);

		var err = callbackSpy.lastCall.args[0];
		assert.instanceOf(err, ApiParseError);
		assert.strictEqual(err.message, 'Missing response node from: /foo');
		assert.strictEqual(err.response, xml);
		assert.strictEqual(err.statusCode, 123);
	});

	it('calls back with the error when the response status is error', function () {
		var callbackSpy = sinon.spy();
		var xml = fs.readFileSync(
				path.join(__dirname, 'responses', 'release-not-found.xml'),
				'utf-8');

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert.lengthOf(callbackSpy.lastCall.args, 1);

		var err = callbackSpy.lastCall.args[0];
		assert(err);
		assert.instanceOf(err, ApiError);
		assert.equal(err.code, '2001');
		assert.equal(err.message, 'Release not found: /foo');
		assert.equal(err.statusCode, 123);
	});

	it('calls back with error when response status is not ok or error', function () {
		var callbackSpy = sinon.spy();
		var xml = '<response status="bang" />';

		parser.parse(xml, createOptsWithFormat('js'), callbackSpy);
		assert(callbackSpy.calledOnce);
		assert.lengthOf(callbackSpy.lastCall.args, 1);

		var err = callbackSpy.lastCall.args[0];
		assert.instanceOf(err, ApiParseError);
		assert.strictEqual(err.message, 'Unexpected response status from: /foo');
		assert.strictEqual(err.response, xml);
		assert.strictEqual(err.statusCode, 123);
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

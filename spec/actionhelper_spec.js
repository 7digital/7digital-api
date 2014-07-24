'use strict';
var assert = require('chai').assert;
var actionhelper = require('../lib/actionhelper');

describe('templateParams', function () {

	it('should return a param for a templated url', function () {
		var url = 'foo/:bar/baz';
		assert.deepEqual(actionhelper.templateParams(url), [ ':bar' ]);
	});

	it('should return false for a url with out params', function () {
		var url = 'foo/bar/baz';
		assert.isNull(actionhelper.templateParams(url));
	});

});

describe('template', function () {

	it('should replace params', function () {
		var template = 'foo/:bAr/baz/:quux';
		var params = {
			bar: 'hello',
			qUuX: 'world',
			remaining: 'param'
		};

		assert.strictEqual(actionhelper.template(template, params),
			'foo/hello/baz/world');
		assert.deepEqual(params, { remaining: 'param' });
	});

	it('should throw when missing parameters', function () {
		var template = 'foo/:bAr/baz/:quux';
		var params = {
			bar: 'hello'
		};

		assert.throws(function () {
			actionhelper.template(template, params);
		});
	});

});

'use strict';

var assert = require('chai').assert;

function die(msg) {
	throw new Error(msg);
}

function fromEnvOrDie(key) {
	return process.env[key] || die('no ' + key + ' set');
}

describe('api when oauth is required', function () {
	var consumerKey, consumerSecret, voucherCode, preOAuthedToken, userToken,
		userSecret, api;

	before(function () {
		consumerKey = fromEnvOrDie('NODE_API_CLIENT_TESTS_CONSUMER_KEY');
		consumerSecret = fromEnvOrDie('NODE_API_CLIENT_TESTS_CONSUMER_SECRET');
		voucherCode = fromEnvOrDie('NODE_API_CLIENT_TESTS_VOUCHER_CODE');
		userToken = fromEnvOrDie('NODE_API_CLIENT_TESTS_USER_TOKEN');
		userSecret = fromEnvOrDie('NODE_API_CLIENT_TESTS_USER_SECRET');

		// Clear the module cache to get a fresh API - other int tests mutate
		// the schema
		require('module')._cache = {};
		api = require('../index').configure({
			consumerkey: consumerKey,
			consumersecret: consumerSecret
		});
	});

	it('propagates errors when unauthorised (2-legged)', function (done) {
		var unauthedApi = require('../index');
		var basketApi = new unauthedApi.Basket();

		basketApi.applyVoucher({}, function (err, rs) {
			assert.ok(err, 'no error returned from api');
			assert.match(err.data, /oauth/i,
				'error message did not mention oauth');
			done();
		});
	});

	it('applies a voucher (2-legged oauth)', function (done) {
		var basketApi = new api.Basket();

		basketApi.create({}, function (err, rs) {
			var basket;

			assert.notOk(err, 'error after basket/create: ' + err);

			basket = rs.basket;

			assert.ok(basket.id, 'no basketId returned by api basket/create');

			basketApi.addItem({
				basketId: basket.id,
				releaseId: 1188827,
				itemId: 30173868
			}, function (err, rs) {
				var basketAfterAddItem;
				assert.notOk(err, 'error after basket/addItem: ' + err);

				basketAfterAddItem = rs.basket;

				assert.lengthOf(basketAfterAddItem.basketItems, 1,
					'unexpected number of basket items after basket/addItem');

				assert(+basketAfterAddItem.amountDue.amount > 0,
				'expected non-zero amountDue in basket after basket/addItem');

				basketApi.applyVoucher({
					basketId: basket.id,
					voucherCode: voucherCode
				}, function (err, rs) {
					var basketAfterVoucher;

					assert.notOk(err,
						'error after basket/applyVoucher: ' + err);

					basketAfterVoucher = rs.basket;

					assert.equal(basketAfterVoucher.amountDue.amount, 0,
						'expected free basket after basket/applyVoucher');

					done();
				});
			});
		});
	});

	it('propagates errors when unauthorised (3-legged oauth)',
		function (done) {

		var user = new api.User();

		user.getLocker({}, function (err, res) {
			assert.ok(err, 'expected an error');
			assert.match(err.data, /oauth.*token/i,
				'error message did not mention oauth or tokens');
			done();
		});
	});

	it('fetches a pre-authorised user\'s locker (3-legged oauth)',
		function (done) {

		this.timeout(30000);

		var user = new api.User();

		user.getLocker({
			accesstoken: userToken,
			accesssecret: userSecret
		}, function (err, res) {
			var errMsg = err ? err.data : '';
			assert.notOk(err, 'unexpected error: ' + errMsg);
			done();
		});

	});
});

describe('User management', function () {
	var exec = require('child_process').exec,
		path = require('path');

	it('creates users', function(done) {
		exec('node ' + path.join(__dirname, '../examples/create-user.js'),
			function assertOutput(err, stdout, stderr) {
				assert(!err);
				assert.match(stdout, /lockerReleases/);
				done();
		});
	});

});

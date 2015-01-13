'use strict';

var assert = require('chai').assert;
var https = require('https');
var uncachedRequire = require('../test/util').uncachedRequire;
var OAuthError = require('../lib/errors').OAuthError;

function die(msg) {
	throw new Error(msg);
}

function fromEnvOrDie(key) {
	return process.env[key] || die('no ' + key + ' set');
}

describe('api when oauth is required', function () {
	var voucherCode, userToken, userSecret, api;

	before(function () {
		fromEnvOrDie('_7D_API_CLIENT_CONSUMER_KEY');
		fromEnvOrDie('_7D_API_CLIENT_CONSUMER_SECRET');
		voucherCode = fromEnvOrDie('_7D_API_CLIENT_TEST_VOUCHER_CODE');
		userToken = fromEnvOrDie('_7D_API_CLIENT_USER_TOKEN');
		userSecret = fromEnvOrDie('_7D_API_CLIENT_USER_SECRET');

		api = uncachedRequire('../index');
	});

	it('propagates errors when unauthorised (2-legged)', function (done) {
		var unauthedApi = uncachedRequire('../index').configure({
			consumerkey: '',
			consumersecret: ''
		});
		var basketApi = new unauthedApi.Basket();

		basketApi.applyVoucher({}, function (err, rs) {
			assert.ok(err, 'no error returned from api');
			assert.instanceOf(err, OAuthError);
			assert.match(err.message, /oauth/i,
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
			assert.instanceOf(err, OAuthError);
			assert.match(err.message, /oauth.*token/i,
				'error message did not mention oauth or tokens');
			done();
		});
	});

	it('fetches a pre-authorised user\'s locker (3-legged oauth)',
		function (done) {
		var user = new api.User();

		this.timeout(30000);
		user.getLocker({
			accesstoken: userToken,
			accesssecret: userSecret
		}, function (err, res) {
			var errMsg = err ? err.data : '';
			assert.notOk(err, 'unexpected error: ' + errMsg);
			done();
		});
	});

	it('signs 3-legged locker stream urls', function (done) {
		var oauth = new api.OAuth({
			defaultParams: {
				country: 'gb',
				accesstoken: userToken,
				accesssecret: userSecret
			}
		});
		var signedUrl = oauth.sign(
			'https://stream.svc.7digital.net/stream/locker',
			{ trackId: 29286733, formatId: 26 });

		https.get(signedUrl, function checkResponse(response) {
			assert.equal(response.statusCode, 200);
			done();
		}).on('error', done);
	});

});

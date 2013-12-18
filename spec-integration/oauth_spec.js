var assert = require('chai').assert;

function die(msg) {
	throw new Error(msg);
}

describe('api when oauth is required', function () {
	var consumerKey, consumerSecret, voucherCode, preOAuthedToken, api;

	before(function () {
		consumerKey = process.env['NODE_API_CLIENT_TESTS_CONSUMER_KEY'] || die('no NODE_API_CLIENT_TESTS_CONSUMER_KEY set');
		consumerSecret = process.env['NODE_API_CLIENT_TESTS_CONSUMER_SECRET'] || die('no NODE_API_CLIENT_TESTS_CONSUMER_SECRET set');
		voucherCode = process.env['NODE_API_CLIENT_TESTS_VOUCHER_CODE'] || die('no NODE_API_CLIENT_TESTS_VOUCHER_CODE set');
		userToken = process.env['NODE_API_CLIENT_TESTS_USER_TOKEN'] || die('no NODE_API_CLIENT_TESTS_USER_TOKEN set');
		userSecret = process.env['NODE_API_CLIENT_TESTS_USER_SECRET'] || die('no NODE_API_CLIENT_TESTS_USER_SECRET set');

		api = require('../index').configure({
			consumerkey: consumerKey,
			consumersecret: consumerSecret
		});
	});

	it('should propagate errors correctly when unauthorised (two-legged oauth)', function (done) {
		var unauthedApi = require('../index');
		var basketApi = new unauthedApi.Basket();

		basketApi.applyVoucher({}, function (err, rs) {
			assert.ok(err, 'no error returned from api');
			assert.match(err.data, /oauth/i, 'error message did not mention oauth');
			done();
		});
	});

	it('should be able apply a voucher (two-legged oauth)', function (done) {
		//create a basket
		var basketApi = new api.Basket();

		basketApi.create({}, function (err, rs) {
			assert.notOk(err, 'error after basket/create: ' + err);

			var basket = rs.basket;

			assert.ok(basket.id, 'no basketId returned by api basket/create');

			basketApi.addItem({
				basketId: basket.id,
				releaseId: 1188827,
				itemId: 30173868
			}, function (err, rs) {
				assert.notOk(err, 'error after basket/addItem: ' + err);

				var basketAfterAddItem = rs.basket;

				assert.lengthOf(basketAfterAddItem.basketItems, 1,
					'unexpected number of basket items after basket/addItem');

				assert(+basketAfterAddItem.amountDue.amount > 0,
				'expected non-zero amountDue in basket after basket/addItem');

				basketApi.applyVoucher({
					basketId: basket.id,
					voucherCode: voucherCode
				}, function (err, rs) {
					assert.notOk(err, 'error after basket/applyVoucher: ' + err);

					var basketAfterVoucher = rs.basket;

					assert.equal(basketAfterVoucher.amountDue.amount, 0,
						'expected free basket after basket/applyVoucher');

					done();
				});
			});
		});
	});

	it('should propagate errors correctly when unauthorised (three-legged oauth)', function (done) {
		var user = new api.User();

		user.getLocker({}, function (err, res) {
			assert.ok(err, 'expected an error');
			assert.match(err.data, /oauth.*token/i, 'error message did not mention oauth or tokens'); 
			done();
		});
	});

	it('should be able to fetch a pre-authorised user\'s locker (three-legged oauth)', function (done) {
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

var assert = require('chai').assert;

function die(msg) {
	throw new Error(msg);
}

var consumerKey = process.env['_7D_CONSUMER_KEY'] || die('no _7D_CONSUMER_KEY set');
var consumerSecret = process.env['_7D_CONSUMER_SECRET'] || die('no _7D_CONSUMER_SECRET set');
var voucherCode = process.env['_7D_VOUCHER_CODE'] || die('no _7D_VOUCHER_CODE set');

var authenticatedApi = require('../index').configure({
	consumerkey: process.env['_7D_CONSUMER_KEY'],
	consumersecret: process.env['_7D_CONSUMER_SECRET']
});

describe('api when oauth is required', function () {

	it('should propagate errors correctly when unauthorised', function (done) {
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
		var basketApi = new authenticatedApi.Basket();

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
});

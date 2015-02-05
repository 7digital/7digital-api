var async = require('async');
// Require the API wrapper, if you have npm installed it this would be:
//     var api= require('7digital-api');
var voucherCode = process.env.NODE_API_CLIENT_TESTS_VOUCHER_CODE;
var consumerKey = process.env.NODE_API_CLIENT_TESTS_CONSUMER_KEY;
var consumerSecret = process.env.NODE_API_CLIENT_TESTS_CONSUMER_SECRET;
var api = require('../index').configure({
	consumerkey: consumerKey,
	consumersecret: consumerSecret
});
var basketId;

// Make a request using the wrapper and process the result
async.waterfall([
	function createBasket(cb) {
		api.Basket().create({ artistid: 1 }, function processReleases(err, res) {
			if (err) { return cb(err); }
			basketId = res.basket.id;
			console.log('Created basket', basketId);
			return cb();
		});
	},
	function addToBasket(cb) {
		api.Basket().addItem({
			basketId: basketId,
			releaseId: 769006,
			trackId: 13166687 // Test content
		}, function (err, res) {
			if (err) { return cb(err); }
			console.log('Added to basket: ', res.basket.basketItems[0]);
			return cb();
		});
	},
	function applyVoucher(cb) {
		api.Basket().applyVoucher({
			basketId: basketId,
			voucherCode: voucherCode
		}, function (err, res) {
			if (err) { return cb(err); }
			console.log('Applied voucher to: ', res.basket.basketItems[0]);
			return cb();
		});
	}
], function (err) {
	if (err) { throw err; }
	console.log('Example completed successfully');
});

var async = require('async');
// Require the API wrapper, if you have npm installed it this would be:
//     var api= require('7digital-api');
var consumerKey = process.env.NODE_API_CLIENT_TESTS_CONSUMER_KEY;
var consumerSecret = process.env.NODE_API_CLIENT_TESTS_CONSUMER_SECRET;
var api = require('../index').configure({
	consumerkey: consumerKey,
	consumersecret: consumerSecret,
	defaultParams: { shopId: 826 }
});
var basketId;

console.log('Api configured with shopId %d', api.options.defaultParams.shopId);
async.waterfall([
	function createBasket(cb) {
		api.Basket().create({ artistid: 1 }, function processReleases(err, res) {
			if (err) { return cb(err); }
			basketId = res.basket.id;
			console.log('Created basket', basketId);
			return cb();
		});
	},
	function reconfigureApiShop(cb) {
		// Change to a different shop (where the basket won't be valid)
		api = api.reconfigure({ defaultParams: { shopId: 34 }});
		console.log('Api configured with shopId %d', api.options.defaultParams.shopId);
		return cb();
	},
	function addToBasket(cb) { // Check GET is reconfigured
		api.Basket().addItem({
			basketId: basketId,
			releaseId: 769006,
			trackId: 13166687 // Test content
		}, function (err, res) {
			if (err && err.code === '2002') {
				// Got the expected country restriction error for GET
				console.log('First shop reconfiguration successful for GET');
				return cb();
			}
			return cb(new Error('First shop reconfiguration unsuccessful for GET'));
		});
	},
	function applyVoucher(cb) { // Check POST is reconfigured
		api.Basket().applyVoucher({
			basketId: basketId,
			voucherCode: 'some-voucher'
		}, function (err) {
			if (err && err.code === '2002') {
				// Got the expected country restriction error for POST
				console.log('First shop reconfiguration successful for POST');
				return cb();
			}
			return cb(new Error('First shop reconfiguration unsuccessful for POST'));
		});
	},
	function restoreOriginApiShop(cb) {
		// Restore correct shop for the basket
		api = api.reconfigure({ defaultParams: { shopId: 826 }});
		console.log('Api configured with shopId %d', api.options.defaultParams.shopId);
		return cb();
	},
	function addToBasket(cb) { // Check GET is reconfigured again
		api.Basket().addItem({
			basketId: basketId,
			releaseId: 769006,
			trackId: 13166687 // Test content
		}, function (err, res) {
			if (err) {
				return cb(new Error('Second shop reconfiguration unsuccessful for GET: ' + err));
			}
			console.log('Second shop reconfiguration successful for GET');
			return cb();
		});
	},
	function applyVoucher(cb) { // Check POST is reconfigured again
		api.Basket().applyVoucher({
			basketId: basketId,
			voucherCode: 'some-voucher'
		}, function (err) {
			if (err && err.code === '2001') {
				// Got the expected voucher not found error
				console.log('Second shop reconfiguration successful for POST');
				return cb();
			}
			return cb(new Error('Second shop reconfiguration unsuccessful for POST'));
		});
	}
], function (err) {
	if (err) { throw err; }
	console.log('Example completed successfully');
});

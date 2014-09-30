// Require the API wrapper, if you have npm installed it this would be:
//     var api= require('7digital-api');
var voucherCode = process.env.NODE_API_CLIENT_TESTS_VOUCHER_CODE;
var consumerKey = process.env.NODE_API_CLIENT_TESTS_CONSUMER_KEY;
var consumerSecret = process.env.NODE_API_CLIENT_TESTS_CONSUMER_SECRET;
var api = require('../index').configure({
	consumerkey: consumerKey,
	consumersecret: consumerSecret
});
var basket = new api.Basket();

function logResult(err, res) {
	if (err) {
		console.error(err);
	}
	console.dir(res);
}

// Make a request using the wrapper and process the result
basket.create({ artistid: 1 }, function processReleases(err, res) {
	var basketId;
	logResult(err, res);
	if (err) { return; }

	basketId = res.basket.id;

	basket.addItem({
		basketId: basketId,
		releaseId: 769006,
		trackId: 13166687 // Test content
	}, function (err, res) {
		logResult(err, res);
		if (err) { return; }

		basket.applyVoucher({ basketId: basketId, voucherCode: voucherCode },
			function (err, result) {
				logResult(err, result);
				if (err) { return; }
			});

	});
});

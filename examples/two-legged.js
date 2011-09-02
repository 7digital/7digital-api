// Require the API wrapper, if you have npm installed it this would be:
//     var api= require('7digital-api');
var api = require('../index'),
	basket = new api.Basket();

// Make a request using the wrapper and process the result
basket.create({ artistid: 1 }, function processReleases(err, data) {
	var basketId;
	if (err) {
		console.log(err);
		return;
	}
	console.dir(data);

	basketId = data.basket.id;

	basket.applyVoucher({ baketId: basketId, voucherCode: '' },
		function (err, result) {
			if (err) {
				console.log(err);
				return;
			}

			console.dir(result);
		});
});

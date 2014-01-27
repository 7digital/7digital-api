var xml2js = require('xml2js'),
	underscore = require('underscore');

// Tidies up and optionally parses the XML API response
//
// The `options` argument should contain the following properties:
//
// - *format* - The desired response format
// - *logger* - An instance of {Winston.Logger} for output
//
// - @param {Object} options
// - @constructor
function ResponseParser(options) {
	this.format = options.format;
	this.logger = options.logger;
}

// The API returns resources as either a single object or an array.
// This makes responses fiddly to deal with for consumers as they
// manually check whether the resource has a length an access the
// property appropriately.  This method checks for an object and
// wraps it in an array if it is.
//
// - @param {Object} response
// - @return {Object} the normalised response
ResponseParser.prototype.normaliseResourceArrays = function (response) {
	var items;

	underscore([
			'tracks.track',
			'artists.artist',
			'chart.chartItem',
			'releases.release',
			'searchResults.searchResult',
			'recommendations.recommendedItem',
			'tags.tag',
			'taggedResults.taggedItem' //
		]).each(function checkLength(item) {
			var parts = item.split('.'),
				parent = parts[0],
				child = parts[1];

			// e.g. an artist/byTag/top with only one result then:
			//  typeof response.taggedResults.taggedItem === 'object'
			// but when there are many then:
			//  typeof response.taggedResults.taggedItem === 'array'
			// We want these to always be arrays for convenience
			if (response[parent] && response[parent][child] &&
				!response[parent][child].length) {
				response[parent][child] = [response[parent][child]];
			}
		});

	// basket is a special case: we want to fold basketItem into basketItems
	// which is a redundant wrapper.
	if (response.basket && response.basket.basketItems &&
		response.basket.basketItems.basketItem) {

		items = response.basket.basketItems.basketItem;
		items = items.length ? items : [items];
		response.basket.basketItems = items;
	} else if (response.basket && response.basket.basketItems !== undefined &&
			!underscore.isArray(response.basket.basketItems)) {
		response.basket.basketItems = [];
	}

	return response;
};

// Callback for parsing the XML response return from the API
// and converting it to JSON and handing control back to the
// caller.
//
// - @param {Function} callback - the caller's callback
// - @param {String} response - the XML response from the API
ResponseParser.prototype.parse = function (callback, err, response) {
	var parser,
		self = this;

	if (err) {
		callback(err);
		return;
	}

	if (this.format.toUpperCase() === 'XML') {
		callback(null, response);
		return;
	}

	parser = new xml2js.Parser({ mergeAttrs: true, explicitArray: false });

	// Check the request was authorised
	if (response.statusCode === 401) {
		callback(response);
		return;
	}

	this.logger.silly(response);
	parser.parseString(response + '', function (err, result) {
		// Manually remove the xml namespace bits
		if (err) {
			callback(new Error(err));
		} else if (!result.response) {
			callback(new Error('unexpected response returned by api'));
		} else {
			delete result['xmlns:xsi'];
			delete result['xsi:noNamespaceSchemaLocation'];
			if (result.response.status === 'error') {
				callback(result.response.error);
			} else if (result.response.status !== 'ok') {
				callback(new Error('unrecognised response status "' +
									result.response.status + '" from api'));
			}
			else {
				var normalisedResult = self.normaliseResourceArrays(result.response);
				callback(null, normalisedResult);
			}
		}
	});
};

module.exports = ResponseParser;

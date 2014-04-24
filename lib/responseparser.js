var xml2js = require('xml2js'),
	underscore = require('underscore'),
	ApiParseError = require('./errors').ApiParseError,
	ApiError = require('./errors').ApiError;

function arrayify(items) {
	return items.length ? items : [items];
}

// The API returns resources as either a single object or an array.
// This makes responses fiddly to deal with for consumers as they
// manually check whether the resource has a length an access the
// property appropriately.  This method checks for an object and
// wraps it in an array if it is.
//
// - @param {Object} response
// - @return {Object} the normalised response
function normaliseResourceArrays(response) {
	var items, formats, listItems;

	underscore([
			'tracks.track',
			'artists.artist',
			'chart.chartItem',
			'releases.release',
			'searchResults.searchResult',
			'recommendations.recommendedItem',
			'tags.tag',
			'taggedResults.taggedItem',
			'cardTypes.cardType'
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

	if (response.release && response.release.formats
		&& response.release.formats.format) {
			formats = response.release.formats.format;
			response.release.formats.format = arrayify(formats);
	}

	if (response.list && response.list.listItems
		&& response.list.listItems.listItem) {
			listItems = response.list.listItems.listItem;
			response.list.listItems.listItem = arrayify(listItems);
	}

	// basket is a special case: we want to fold basketItem into basketItems
	// which is a redundant wrapper.
	if (response.basket && response.basket.basketItems &&
		response.basket.basketItems.basketItem) {

		items = response.basket.basketItems.basketItem;
		items = arrayify(items);
		response.basket.basketItems = items;
	} else if (response.basket && response.basket.basketItems !== undefined &&
			!underscore.isArray(response.basket.basketItems)) {
		response.basket.basketItems = [];
	}

	return response;
}

function renameTextNodes(response) {
	underscore({
		'cardTypes.cardType' : 'name'
	}).each(function renameTextNode(name, item) {
		var parts = item.split('.'),
			parent = parts[0],
			child = parts[1];

		// Text nodes are given the key '_' if there are attributes present on
		// the node
		function doRename(obj) {
			obj[name] = obj._;
			delete obj._;
		}

		if (response[parent] && response[parent][child]) {

			var node = response[parent][child];
			if (node.length !== undefined) {
				underscore(node).each(function (subNode) {
					doRename(subNode);
				});
			} else {
				doRename(node);
			}

		}
	});

	return response;
}

// Callback for parsing the XML response return from the API
// and converting it to JSON and handing control back to the
// caller.
//
// - @param {Function} callback - the caller's callback
// - @param {String} response - the XML response from the API
// - @parma {Object} opts - an options hash with the desired format and logger
function parse(response, opts, callback) {
	var parser;

	if (opts.format.toUpperCase() === 'XML') {
		callback(null, response);
		return;
	}

	opts.logger.silly(response);

	parser = new xml2js.Parser({ mergeAttrs: true, explicitArray: false });

	parser.parseString(response, validateAndCleanResponse);
	function validateAndCleanResponse(err, result) {
		var cleanedResult;
		var clean;
		if (err) {
			return callback(new ApiParseError(
				'error parsing api response: ' + err.message, response));
		} else if (!result.response) {
			return callback(new ApiParseError(
				'unexpected response returned by api', response));
		}

		// Manually remove the xml namespace bits
		delete result.response['xmlns:xsi'];
		delete result.response['xmlns:xsd'];
		delete result.response['xsi:noNamespaceSchemaLocation'];

		if (result.response.status === 'error') {
			return callback(new ApiError(result.response.error));
		} else if (result.response.status !== 'ok') {
			return callback(new ApiParseError(
				'unrecognised response status "' +
				result.response.status + '" from api', response));
		}

		clean = underscore.compose(
			renameTextNodes,
			normaliseResourceArrays);

		cleanedResult = clean(result.response);
		return callback(null, cleanedResult);
	}
}

module.exports.parse = parse;
module.exports.normaliseResourceArrays = normaliseResourceArrays;

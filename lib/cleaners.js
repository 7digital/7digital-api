'use strict';

var _ = require('lodash');

function arrayify(items) {
	return items.length ? items : [items];
}

// The API returns resources as either a single object or an array.
// This makes responses fiddly to deal with for consumers as they
// manually check whether the resource has a length an access the
// property appropriately.	This method checks for an object and
// wraps it in an array if it is.
//
// - @param {Object} response
// - @return {Object} the normalised response
function ensureCollections(collectionPaths, response) {
	var items, formats, listItems, basket;

	_(collectionPaths).each(function checkLength(item) {
		var parts = item.split('.');
		var allPartsButLast = _.initial(parts);
		var lastPart = _.last(parts);
		var parents = _.reduce(allPartsButLast, function (chain, part) {
			return chain.pluck(part).compact().flatten();
		}, _([response])).value();

		parents.map(function (parent) {
			if (parent[lastPart]) {
				parent[lastPart] = arrayify(parent[lastPart]);
			} else {
				parent[lastPart] = [];
			}
		});
	});

	basket = response.basket;
	if (basket) {
		if (basket.basketItems.basketItem) {
			basket.basketItems = basket.basketItems.basketItem;
		} else {
			basket.basketItems = [];
		}
	}

	return response;
}

module.exports.ensureCollections = ensureCollections;

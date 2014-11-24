'use strict';

var _ = require('lodash');

function arrayify(items) {
	return (items.length !== undefined) ? items : [items];
}

// The API returns resources as either a single object or an array.
// This makes responses fiddly to deal with for consumers as they
// manually check whether the resource has a length an access the
// property appropriately. This method checks the reponse for the
// existence of a property path and if it is an object wraps it in
// an array.
//
// - @param {String} collectionPaths
// - @param {Object} response
// - @return {Object} the modified response
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

function renameCardTypes(response) {
	if (response.cardTypes && response.cardTypes.cardType) {
		_(response.cardTypes.cardType).each(function rename(cardType) {
			cardType.name = cardType._;
			delete cardType._;
		});
	}

	return response;
}

function nullifyNilsRecursive(parent, key) {
	var value = parent[key];

	if (value['xsi:nil'] === 'true') {
		parent[key] = null;
		return;
	}

	if (_.isArray(value) || _.isObject(value)) {
		_.forEach(value, function (v, k) {
			return nullifyNilsRecursive(value, k);
		});
	}
}

function nullifyNils(response) {
	_.forEach(response, function (v, k) {
		nullifyNilsRecursive(response, k);
	});

	return response;
}

// Given a deserialized XML response this function will remove the xml
// specific nodes that aren't interesting to consumers.
//
// - @param {Object} response - the deserialized XML response object
// - @return {Object} the reponse with the XMl namespace keys removed
function removeXmlNamespaceKeys(response) {
	delete response['xmlns:xsi'];
	delete response['xmlns:xsd'];
	delete response['xsi:noNamespaceSchemaLocation'];
	return response;
}

module.exports.ensureCollections = ensureCollections;
module.exports.renameCardTypes = renameCardTypes;
module.exports.removeXmlNamespaceKeys = removeXmlNamespaceKeys;
module.exports.nullifyNils = nullifyNils;

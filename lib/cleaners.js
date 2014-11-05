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

function renameTextNodes(response) {
	_({
		'cardTypes.cardType' : 'name'
	}).each(function renameTextNode(name, item) {
		var parts = item.split('.');
		var parent = parts[0];
		var child = parts[1];

		// Text nodes are given the key '_' if there are attributes present on
		// the node
		function doRename(obj) {
			obj[name] = obj._;
			delete obj._;
		}

		if (response[parent] && response[parent][child]) {

			var node = response[parent][child];
			if (node.length !== undefined) {
				_(node).each(function (subNode) {
					doRename(subNode);
				});
			} else {
				doRename(node);
			}

		}
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
module.exports.renameTextNodes = renameTextNodes;
module.exports.removeXmlNamespaceKeys = removeXmlNamespaceKeys;

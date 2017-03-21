'use strict';

var _ = require('lodash');

function renameCardTypes(response) {
	if (response.cardTypes && response.cardTypes.cardType) {
		_.each(response.cardTypes.cardType, function rename(cardType) {
			cardType.name = cardType._;
			delete cardType._;
		});
	}

	return response;
}

function nullifyNilsRecursive(parent, key) {
	var value = parent[key];

	if (!value) { return; }

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

module.exports.ensureCollections = require('./ensure-collections');
module.exports.renameCardTypes = renameCardTypes;
module.exports.removeXmlNamespaceKeys = removeXmlNamespaceKeys;
module.exports.nullifyNils = nullifyNils;
module.exports.collectionPaths = require('./collection-paths');

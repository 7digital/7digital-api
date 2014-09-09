'use strict';

var xml2js = require('xml2js');
var _ = require('lodash');
var ApiParseError = require('./errors').ApiParseError;
var ApiError = require('./errors').ApiError;
var ensureCollections = require('./cleaners').ensureCollections;
var collectionPaths = [
	'artists.artist',
	'chart.chartItem',
	'releases.release',
	'searchResults.searchResult',
	'recommendations.recommendedItem',
	'tags.tag',
	'tracks.track',
	'taggedResults.taggedItem',
	'cardTypes.cardType',
	//NB: the outermost item to be arrayified must come first
	'locker.lockerReleases.lockerRelease',
	'locker.lockerReleases.lockerRelease.lockerTracks.lockerTrack',
	'locker.lockerReleases.lockerRelease.lockerTracks.lockerTrack.downloadUrls.downloadUrl',
	'release.formats.format',
	'list.listItems.listItem',
	'basket.basketItems.basketItem'
];

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

	parser = new xml2js.Parser({
		mergeAttrs: true,
		explicitArray: false
	});

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

		clean = _.compose(
			renameTextNodes,
			ensureCollections.bind(null, collectionPaths));

		cleanedResult = clean(result.response);
		return callback(null, cleanedResult);
	}
}

module.exports.parse = parse;

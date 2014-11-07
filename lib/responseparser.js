'use strict';

var xml2js = require('xml2js');
var _ = require('lodash');
var ApiParseError = require('./errors').ApiParseError;
var ApiError = require('./errors').ApiError;
var cleaners = require('./cleaners');
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
	'basket.basketItems.basketItem',
	'cards.card'
];

// Callback for parsing the XML response return from the API
// and converting it to JSON and handing control back to the
// caller.
//
// - @param {Function} callback - the caller's callback
// - @param {String} response - the XML response from the API
// - @parma {Object} opts - an options hash with the desired format and logger
function parse(response, opts, callback) {
	var parser, jsonParseError, result;

	if (opts.format.toUpperCase() === 'XML') {
		callback(null, response);
		return;
	}

	if (opts.contentType && opts.contentType.indexOf('json') >= 0) {
		try {
			result = JSON.parse(response);
		} catch (e) {
			jsonParseError = e;
		}
		return validateAndCleanResponse(jsonParseError, { response: result });
	}

	parser = new xml2js.Parser({
		mergeAttrs: true,
		explicitArray: false
	});

	parser.parseString(response, validateAndCleanResponse);
	function validateAndCleanResponse(err, result) {
		var cleanedResult;
		var clean;

		// Unparsable response text
		if (err) {
			return callback(new ApiParseError(
				'error parsing api response: ' + err.message, response));
		} else if (!result.response) {
			return callback(new ApiParseError(
				'unexpected response returned by api', response));
		}

		// Reponse was a 7digital API error object
		if (result.response.status === 'error') {
			return callback(new ApiError(result.response.error));
		} else if (result.response.status !== 'ok') {
			return callback(new ApiParseError(
				'unrecognised response status "' +
				result.response.status + '" from api', response));
		}

		clean = _.compose(
			cleaners.renameCardTypes,
			cleaners.ensureCollections.bind(null, collectionPaths),
			cleaners.removeXmlNamespaceKeys);

		cleanedResult = clean(result.response);
		return callback(null, cleanedResult);
	}
}

module.exports.parse = parse;

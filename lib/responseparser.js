'use strict';

var xml2js = require('xml2js');
var _ = require('lodash');
var ApiParseError = require('./errors').ApiParseError;
var ApiError = require('./errors').ApiError;
var cleaners = require('./cleaners');
var collectionPaths = [
	//NB: the outermost item to be arrayified must come first
	'artists.artist',
	'chart.chartItem',
	'chart.chartItem.release.download.packages.package',
	'chart.chartItem.release.download.packages.package.formats.format',
	'chart.chartItem.track.download.packages.package',
	'chart.chartItem.track.download.packages.package.formats.format',
	'releases.release',
	'releases.release.download.packages.package',
	'releases.release.download.packages.package.formats.format',
	'searchResults.searchResult',
	'searchResults.searchResult.release.download.packages.package',
	'searchResults.searchResult.release.download.packages.package.formats.format',
	'searchResults.searchResult.track.download.packages.package',
	'searchResults.searchResult.track.download.packages.package.formats.format',
	'recommendations.recommendedItem',
	'recommendations.recommendedItem.release.download.packages.package',
	'recommendations.recommendedItem.release.download.packages.package.formats.format',
	'tags.tag',
	'tracks.track',
	'tracks.track.download.packages.package',
	'tracks.track.download.packages.package.formats.format',
	'taggedResults.taggedItem',
	'taggedResults.taggedItem.release.download.packages.package',
	'taggedResults.taggedItem.release.download.packages.package.formats.format',
	'cardTypes.cardType',
	'locker.lockerReleases.lockerRelease',
	'locker.lockerReleases.lockerRelease.lockerTracks.lockerTrack',
	'locker.lockerReleases.lockerRelease.lockerTracks.lockerTrack.downloadUrls.downloadUrl',
	'release.formats.format',
	'release.download.packages.package',
	'release.download.packages.package.formats.format',
	'list.listItems.listItem',
	'list.listItems.listItem.release.download.packages.package',
	'list.listItems.listItem.release.download.packages.package.formats.format',
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
			cleaners.removeXmlNamespaceKeys,
			cleaners.nullifyNils);

		cleanedResult = clean(result.response);
		return callback(null, cleanedResult);
	}
}

module.exports.parse = parse;

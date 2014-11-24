'use strict';

var cleaners = require('../lib/cleaners');
var assert = require('chai').assert;

describe('cleaners', function () {

	function createOptsWithFormat(format) {
		return {
			format: format,
			logger: { silly: function () {} }
		};
	}

	describe('ensureCollections', function () {

		it('ensures collections one level deep', function () {
			var response = require(
				'./responses/parsed/release-tracks-singletrack.json');
			var cleaned = cleaners.ensureCollections(
				['tracks.track'], response);
			assert.instanceOf(cleaned.tracks.track, Array);
		});

		it('ensures collections two levels deep', function () {
			var response = require(
				'./responses/parsed/release-single-format.json');
			var cleaned = cleaners.ensureCollections(
				['release.formats.format'], response);
			assert.instanceOf(cleaned.release.formats.format, Array);
		});

		it('ensures nested collections', function () {
			var lockerTrackArray;
			var response = require(
				'./responses/parsed/locker-single-release-and-track.json');
			var cleaned = cleaners.ensureCollections(
				[
					'locker.lockerReleases.lockerRelease',
					'locker.lockerReleases.lockerRelease.lockerTracks.lockerTrack'
				], response);
			var lockerReleaseArray =
				cleaned.locker.lockerReleases.lockerRelease;
			assert.instanceOf(lockerReleaseArray, Array);
			lockerTrackArray = lockerReleaseArray[0].lockerTracks.lockerTrack;
			assert.instanceOf(lockerTrackArray, Array);
		});

		it('preserves collections when they are already arrays', function () {
			var response = require('./responses/parsed/list-multiple.json');
			var cleaned = cleaners.ensureCollections(
				['list.listItems.listItem'], response);
			assert.instanceOf(cleaned.list.listItems.listItem, Array);
		});

		// Note that basket items are one level deeper than other arrays, hence
		// the separate test.
		it('normalises basket items into an array', function () {
			var response = require('./responses/parsed/basket-additem.json');

			var cleaned = cleaners.ensureCollections(
				['basket.basketItems'], response);
			assert.instanceOf(cleaned.basket.basketItems, Array);
		});

		it('returns an empty collection for empty basket case', function () {
			var response = require('./responses/parsed/basket-empty.json');
			var cleaned = cleaners.ensureCollections(
				['basket.basketItems'], response);
			assert.instanceOf(cleaned.basket.basketItems, Array);
			assert.lengthOf(cleaned.basket.basketItems, 0);
		});

		it('returns an empty collection for empty locker case', function () {
			var response = require('./responses/parsed/locker-release-no-tracks.json');
			var cleaned = cleaners.ensureCollections([
				'locker.lockerReleases.lockerRelease',
				'locker.lockerReleases.lockerRelease.lockerTracks.lockerTrack'
			], response);
			assert.instanceOf(cleaned.locker.lockerReleases.lockerRelease, Array);
			assert.lengthOf(cleaned.locker.lockerReleases.lockerRelease, 1);
			assert.instanceOf(
				cleaned.locker.lockerReleases.lockerRelease[0].lockerTracks.lockerTrack,
				Array);
			assert.lengthOf(
				cleaned.locker.lockerReleases.lockerRelease[0].lockerTracks.lockerTrack,
				0);
		});

	});

	describe('renameCardTypes', function () {

		it('names the payment card text node', function () {
			var response = require('./responses/parsed/payment-card-type.json');
			var cleaned = cleaners.renameCardTypes(response);
			assert.instanceOf(cleaned.cardTypes.cardType, Array);
			assert.equal(cleaned.cardTypes.cardType[0].name, 'Mastercard');
			assert.equal(cleaned.cardTypes.cardType[0].id, 'MASTERCARD');
		});

	});

	describe('removeXmlNamespaceKeys', function () {

		it('removes xml cruft', function () {
			var response = require(
				'./responses/parsed/release-tracks-singletrack.json');
			var cleaned = cleaners.removeXmlNamespaceKeys(response);
			assert.isUndefined(cleaned['xmlns:xsi']);
			assert.isUndefined(cleaned['xmlns:xsd']);
			assert.isUndefined(cleaned['xsi:noNamespaceSchemaLocation:']);
		});

	});

	describe('nullifyNils', function () {
		it('converts tags with xsi:nil attributes to "null"', function () {
			var response = {
				a: {
					b: { c: { 'xsi:nil': 'true' } },
					d: 'hello'
				},
				e: {'xsi:nil': 'true'},
				f: 'there',
				g: [{ 'xsi:nil': 'true' }, { h: 'blah' }]
			};

			var cleaned = cleaners.nullifyNils(response);
			assert.equal(cleaned.a.d, 'hello');
			assert.isNull(cleaned.a.b.c);
			assert.isNull(cleaned.e);
			assert.isNull(cleaned.g[0]);
			assert.equal(cleaned.g[1].h, 'blah');
		});
	});

});

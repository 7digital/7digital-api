'use strict';

var cleaners = require('../../lib/response-cleaners');
var assert = require('chai').assert;
var ensureCollections = cleaners.ensureCollections.bind(null, cleaners.collectionPaths);


describe('ensure collections', function () {
	describe('empty merchandising lists', function () {
		//This is a known bug that has existed for a long time, and could
		//potentially be fixed by the discussion in:
		//https://github.com/raoulmillais/7digital-api/pull/76
		var merchlistResponse;
		before(function () {
			merchlistResponse = {
				status: 'ok',
				version: '1.2',
				list: { id: '833', key: 'tabAlbums', listItems: '\n    ' }
			};
		});
		it('doesn\'t throw an exception', function (done) {
			assert.doesNotThrow(function () {
				ensureCollections(merchlistResponse);
				done();
			});
		});
		xit('creates an empty array', function () {
			var merchlistResponse = {
				status: 'ok',
				version: '1.2',
				list: { id: '833', key: 'tabAlbums', listItems: '\n    ' }
			};

			var cleaned = ensureCollections(merchlistResponse);

			assert.instanceOf(cleaned.list.listItems, Array);
			assert.lengthOf(cleaned.list.listItems, 0);
		});
	});

	describe('locker cases', function () {
		it('doesn\'t remove properties on empty lockers', function () {
			var response = {
				status: 'ok',
				version: '1.2',
				locker: {
					lockerReleases: {
						page: '1', pageSize: '1', totalItems: '3'
					}
				}
			};
			var cleaned = ensureCollections(response);
			assert.instanceOf(cleaned.locker.lockerReleases.lockerRelease, Array);
			assert.equal(cleaned.locker.lockerReleases.page, '1');
			assert.equal(cleaned.locker.lockerReleases.pageSize, '1');
			assert.equal(cleaned.locker.lockerReleases.totalItems, '3');
		});
	});
	describe('real life basket cases', function () {
		var collectionPaths = cleaners.collectionPaths;
		
		it('create', function () {
			var response = {
				status: 'ok',
				version: '1.2',
				basket: { id: '07b229c4-8586-4938-84d2-0056e4569605',
					itemCount: '0',
					price: {
						currency: { _: '£', code: 'GBP' },
						value: '0',
						formattedPrice: '£0.00'
					},
					basketItems: '',
					amountDue: {
						currency: { _: '£', code: 'GBP' },
						amount: '0',
						formattedAmount: '£0.00' }
				}
			};
			var cleaned = ensureCollections(response);
			assert.instanceOf(cleaned.basket.basketItems, Array);
			assert.lengthOf(cleaned.basket.basketItems, 0);
		});

		it('one item', function () {
			var response = {
				status: 'ok',
				version: '1.2',
				basket: {
					id: '07b229c4-8586-4938-84d2-0056e4569605',
					itemCount: '1',
					price: { currency: { _: '£', code: 'GBP' },
					value: '0.99',
					formattedPrice: '£0.99' },
					basketItems: {
						basketItem: {
							id: '519788310',
							type: 'track',
							itemName: 'Prayer in Passing',
							artistName: 'Anoushka Shankar',
							trackId: '1693930',
							releaseId: '160553',
							price: {
								currency: { _: '£', code: 'GBP' },
								value: '0.99',
								formattedPrice: '£0.99'
							},
							amountDue: { amount: '0.99', formattedAmount: '£0.99' },
							package: { id: '2' } 
						}
					},
					amountDue: {
						currency: { _: '£', code: 'GBP' },
						amount: '0.99',
						formattedAmount: '£0.99'
					}
				}
			};
			var cleaned = ensureCollections(response);
			assert.instanceOf(cleaned.basket.basketItems, Array);
			assert.lengthOf(cleaned.basket.basketItems, 1);
		});

		it('2 items', function () {
			var response = {
				status: 'ok',
				version: '1.2',
				basket: { 
					id: '07b229c4-8586-4938-84d2-0056e4569605',
					itemCount: '2',
					price: { currency: { _: '£', code: 'GBP' },
					value: '1.98',
					formattedPrice: '£1.98' },
					basketItems: {
						basketItem: [
							{
								id: '519788311',
								type: 'track',
								itemName: 'U Use To Call Me',
								artistName: 'Erykah Badu',
								trackId: '50507041',
								releaseId: '4972370',
								price: {
									currency: { _: '£', code: 'GBP' },
									value: '0.99',
									formattedPrice: '£0.99'
								},
								amountDue: { amount: '0.99', formattedAmount: '£0.99' },
								package: { id: '2' }
							},
							{
								id: '519788310',
								type: 'track',
								itemName: 'Prayer in Passing',
								artistName: 'Anoushka Shankar',
								trackId: '1693930',
								releaseId: '160553',
								price: {
									currency: { _: '£', code: 'GBP' },
									value: '0.99',
									formattedPrice: '£0.99'
								},
								amountDue: { amount: '0.99', formattedAmount: '£0.99' },
								package: { id: '2' }
							}
						]
					},
					amountDue: {
						currency: { _: '£', code: 'GBP' },
						amount: '1.98',
						formattedAmount: '£1.98' 
					}
				}
			};
			var cleaned = ensureCollections(response);
			assert.instanceOf(cleaned.basket.basketItems, Array);
			assert.lengthOf(cleaned.basket.basketItems, 2);
		});
	});
});

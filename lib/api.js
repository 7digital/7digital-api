'use strict';

var Resource = require('./resource'),
	helpers = require('./helpers'),
	config = require('../config'),
	util = require('util'),
	capitalize = require('./helpers').capitalize,
	_ =  require('lodash'),
	noopCache = require('./noop-cache'),
	api;

// API
//
// Creates a new API wrapper from a schema definition
//
// - @param {Object} options - The API options, see below
// - @param {Object} schema - The definition of the api resources and actions
// see the assets/7digital-api-schema json file.
//
// The options parameter should have the following properties:
//
// - `consumerkey` your application's oauth consumer key
// - `consumersecret` your application's oauth consumer secret
// - `format` the response format
// - `logger` a logger instance for output
//
// - @constructor
// - @param {Object} options
function Api(options, schema) {
	var prop, resourceOptions, resourceConstructor, apiRoot = this;

	// Set default options for any unsupplied overrides
	_.defaults(options, config);

	this.schema = schema;
	this.format = options.format;
	this.logger = options.logger;

	// Creates a constructor with the pre-built resource as its prototype
	// this is syntactic sugar to allow callers to new up the resources.
	function createResourceConstructor(resourcePrototype) {
		function APIResource(resourceOptions) {
			resourceOptions = resourceOptions || {};
			// Override any default options for all requests on this resource
			_.defaults(resourceOptions.defaultParams,
				options.defaultParams);
			_.defaults(resourceOptions, options);

			this.cache = resourceOptions.cache;
			this.format = resourceOptions.format;
			this.logger = resourceOptions.logger;
			this.defaultParams = resourceOptions.defaultParams;
		}

		APIResource.prototype = resourcePrototype;
		return APIResource;
	}

	for (prop in this.schema.resources) {
		if (this.schema.resources.hasOwnProperty(prop)) {
			resourceOptions = options;
			resourceOptions.api = this;
			resourceOptions.resourceDefinition =
				this.schema.resources[prop];

			this[prop] = createResourceConstructor(
				new Resource(resourceOptions, this.schema));
		}
	}
}

// Factory method for creating an API wrapper from a JSON schema definition.
//
// - @param {Object} options - The API options, see below
// - @param {Object} schema - The definition of the api resources and actions
// see the assets/7digital-api-schema json file.
//
// The `options` argument can contain the following properties:
//
// - *consumerkey* - The OAuth consumer key for your application
// - *consumersecret* - The OAuth consumer secret for your application
// - *format* - The format of responses you would like to receive
// - *logger* - An instance of a logger for output from the wrapper
Api.build = function build(options, schema) {
	return new Api(options, schema);
};


// Factory method for creating an API wrapper using defaults.
// We need a separate method with an inlined schemapath so that
// browserify can do the right thing for non-node environments.
Api.buildDefault = function buildDefault() {
	var schema = require('../assets/7digital-api-schema.json');
	return new Api(config, schema);
};

module.exports.Api = Api;

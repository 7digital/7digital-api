'use strict';

var Resource = require('./resource');
var OAuth = require('./oauth').OAuth;
var helpers = require('./helpers');
var config = require('../config');
var util = require('util');
var capitalize = require('./helpers').capitalize;
var _ =  require('lodash');
var api;

function configureSchemaFromEnv(schema) {
	var port;

	if (process.env[ '_7D_API_CLIENT_HOST']) {
		schema.host = process.env['_7D_API_CLIENT_HOST'];
	}

	if (process.env[ '_7D_API_CLIENT_SSL_HOST']) {
		schema.sslHost = process.env['_7D_API_CLIENT_SSL_HOST'];
	}

	if (process.env['_7D_API_CLIENT_PORT']) {
		port = Number(process.env['_7D_API_CLIENT_PORT']);
		if (!isNaN(port)) {
			schema.port = port;
		}
	}

	if (process.env['_7D_API_CLIENT_PREFIX']) {
		if (process.env['_7D_API_CLIENT_PREFIX'].toLowerCase() === 'empty') {
			schema.prefix = '';
		} else {
			schema.prefix = process.env['_7D_API_CLIENT_PREFIX'];
		}
	}
}

// API
//
// Creates a new API wrapper from a schema definition
//
// - @param {Object} options - The API options, see below
// - @param {Object} schema - The definition of the api resources and actions
// see the assets/7digital-api-schema json file.
//
// - @constructor
// - @param {Object} options
//
// The options parameter should have the following properties:
//
// - `consumerkey` your application's oauth consumer key
// - `consumersecret` your application's oauth consumer secret
// - `format` the response format
// - `logger` a logger instance for output
function Api(options, schema) {
	var prop, resourceOptions, resourceConstructor;
	var apiRoot = this;

	// Set default options for any unsupplied overrides
	_.defaults(options, config);
	this.options = options;
	this.schema = schema;

	configureSchemaFromEnv(this.schema);

	// Creates a constructor with the pre-built resource as its prototype
	// this is syntactic sugar to allow callers to new up the resources.
	function createResourceConstructor(resourcePrototype) {
		function APIResource(resourceOptions) {
			// Allow creating resources without `new` keyword
			if (!(this instanceof APIResource)) {
				return new APIResource(resourceOptions);
			}

			resourceOptions = resourceOptions || {};
			// Override any default options for all requests on this resource
			_.defaults(resourceOptions.defaultParams,
				apiRoot.options.defaultParams);
			_.defaults(resourceOptions.headers,
				apiRoot.options.headers);
			_.defaults(resourceOptions, apiRoot.options);

			this.format = resourceOptions.format;
			this.logger = resourceOptions.logger;
			this.defaultParams = resourceOptions.defaultParams;
			this.headers = resourceOptions.headers;
		}

		APIResource.prototype = resourcePrototype;
		return APIResource;
	}

	for (prop in schema.resources) {
		if (schema.resources.hasOwnProperty(prop)) {
			resourceOptions = options;
			resourceOptions.api = this;
			resourceOptions.resourceDefinition =
				schema.resources[prop];

			this[prop] = createResourceConstructor(
				new Resource(resourceOptions, schema));
		}
	}

	this['OAuth'] = createResourceConstructor(new OAuth(options));
}

// Creates a new client with additional / replacement options.
//
// - @param {Object} newOptions - the overriden or additional options for the
// new client
// - @return {Api} - a new api instance with the merged options
Api.prototype.reconfigure = function reconfigure(newOptions) {
	var mergedDefaultParams = _.extend({}, this.options.defaultParams,
		newOptions.defaultParams);
	var mergedHeaders = _.extend({}, this.options.headers,
		newOptions.headers);
	var mergedOptions = _.extend({}, this.options, newOptions);

	mergedOptions.defaultParams = mergedDefaultParams;
	mergedOptions.headers = mergedHeaders;

	return new Api(mergedOptions, this.schema);
};

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
Api.buildDefault = function buildDefault(options) {
	options = options || config;
	var schema = require('../assets/7digital-api-schema.json');
	return new Api(options, schema);
};

module.exports.Api = Api;

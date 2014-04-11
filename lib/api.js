var Resource = require('./resource'),
	config = require('../config'),
	util = require('util'),
	capitalize = require('./helpers').capitalize,
	underscore =  require('underscore'),
	noopCache = require('./noop-cache'),
	api;

// API
//
// Creates a new API wrapper from a schema definition
//
// The options parameter should have the following properties:
//
// - `schema` the API schema definition
// - `consumerkey` your application's oauth consumer key
// - `consumersecret` your application's oauth consumer secret
// - `format` the response format
// - `logger` a logger instance for output
//
// - @constructor
// - @param {Object} options
function Api(options) {
	var prop, resourceOptions, resourceConstructor;

	this.schema = options.schema;
	this.format = options.format;
	this.logger = options.logger;

	// Creates a constructor with the pre-built resource as its prototype
	// this is syntactic sugar to allow callers to new up the resources.
	function createResourceConstructor(resourcePrototype) {
		function APIResource(options) {
			options = options || {};
			this.cache = options.cache || noopCache;
		}

		APIResource.prototype = resourcePrototype;
		return APIResource;
	}

	for (prop in options.schema.resources) {
		if (options.schema.resources.hasOwnProperty(prop)) {
			resourceOptions = options;
			resourceOptions.api = this;
			resourceOptions.resourceDefinition =
				options.schema.resources[prop];

			this[prop] = createResourceConstructor(
				new Resource(resourceOptions));
		}
	}
}

// Gets the schema JSON document used to construct the API
// wrapper
//
// - @return {String}
Api.prototype.getSchema = function () {
	return this.schema;
};

// Gets the classname for a given resource on the API. In conjunction
// with `getActionMethodName` this allows you to translate an API
// URL into a method call on the wrapper.
//
// I.E. Given a path of artist/details, you can resolve the class name for
// the artist component.
//
// - @param {String} - the name of the resource
// - @return {String} - the class name
Api.prototype.getResourceClassName = function (resource) {
	for (var resourceName in this.schema.resources) {
		if (this.schema.resources.hasOwnProperty(resourceName)) {
			if (this.schema.resources[resourceName].resource.toLowerCase() ===
				resource.toLowerCase()) {
				return resourceName;
			}
		}
	}

	return '';
};

// Gets the method name for a call to the wrapper given the resource class name.
// See `getActionMethodName` above for resolving class names.
//
// - @param {String} resourceClassName
// - @param {String} action - the path component of the path
// - @return {String} - the method name on the wrapper
Api.prototype.getActionMethodName = function (resourceClassName, action) {
	var actionMethodName = '';

	this.schema.resources[resourceClassName].actions.forEach(function (act) {
		if (underscore.isString(act) && act.toLowerCase() === action.toLowerCase()) {
			actionMethodName = 'get' + capitalize(act);
		}
		else if (act.apiCall && act.apiCall.toLowerCase() ===
					action.toLowerCase()) {
			actionMethodName = act.methodName;
		}
		else if (act.apiCall === '' && action === '') {
			actionMethodName = act.methodName;
		}
	});

	return actionMethodName;
};

// Factory method for creating an API wrapper from a JSON schema definition.
//
// The `options` argument can contain the following properties:
//
// - *schema* - A JSON string containing the schema definition for the API
// - *consumerkey* - The OAuth consumer key for your application
// - *consumersecret* - The OAuth consumer secret for your application
// - *format* - The format of responses you would like to receive
// - *logger* - An instance of a logger for output from the wrapper
Api.build = function build(options) {
	return new Api(options);
};


// Factory method for creating an API wrapper from a file
//
// The `options` argument can contain the following properties:
//
// - *schemapath* - A path to a file containing the JSON schema definition
//                  for the API
// - *consumerkey* - The OAuth consumer key for your application
// - *consumersecret* - The OAuth consumer secret for your application
// - *format* - The format of responses you would like to receive
// - *logger* - An instance of a logger for output from the wrapper
Api.buildFromFile = function buildFromFile(options) {
	options.schema = require(options.schemapath);
	return new Api(options);
};

// Factory method for creating an API wrapper using defaults.
// We need a separate method with an inlined schemapath so that
// browserify can do the right thing for non-node environments.
Api.buildDefault = function buildDefault() {
	config.schema = require('../assets/7digital-api-schema.json');
	return new Api(config);
};

// Determines the path for a given action on a resource
//
// @param {String} resource
// @param {String} action
Api.prototype.formatPath = function formatPath(resource, action) {
	var requestPath = '/' +
		(this.schema.version ? this.schema.version + '/' : '') +
		resource;

	if (action !== '') {
		requestPath += '/' + action;
	}

	return requestPath;
};

module.exports.Api = Api;

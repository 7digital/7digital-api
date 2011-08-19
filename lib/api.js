"use strict";

var APIBase = require("./apibase").APIBase,
	sys = require("sys"),
	fs = require("fs"),
	StringUtils = require("./stringutils").StringUtils,
	FnUtils = require("./fnutils").FnUtils,
	api;

// API
//
// Creates a new API wrapper from a schema definition
//
// - @constructor
// - @param {String} schema
// - @param {String} oauthkey
// - @param {String} oauthsecret
//
 function Api(schema, oauthkey /*optional*/, oauthsecret /*optional*/, format, logger) {
	this.schema = schema;
	this.format = format;
	this.logger = logger;
	
	function createResourceConstructor(resourceName, format) {
		return function Resource() {
			this.logger = logger;
			this.format = format;
			this.resourceUrlSlug  = resourceName.toLowerCase();
		};
	}
	
	for(var prop in schema.resources) {
		if (schema.resources.hasOwnProperty(prop)) {
			var resourceName = schema.resources[prop].resource;

			var resourceConstructor = createResourceConstructor(resourceName, this.format, logger);

			resourceConstructor.prototype = new APIBase(resourceName, schema.host,
					schema.version, oauthkey, oauthsecret, logger);

			schema.resources[prop].actions.forEach(
			FnUtils.bind(resourceConstructor, resourceConstructor.prototype.buildApiCall));
			this[prop] = resourceConstructor;
		}
	}
}

// Gets the schema JSON document used to construct the API
// wrapper
//
// - @return {String}
Api.prototype.getSchema = function() {
	return this.schema;
};

// Gets the classname for a given resource on the API. In conjunction
// with `getActionMethodName` this allows you to translate an API
// URL into a method call on the wrapper.
//
// I.E.
//
// Given a path of artist/details, you can resolve the class name for
// the artist component.
//
// - @param {String} - the name of the resource
// - @return {String} - the class name
Api.prototype.getResourceClassName = function(resource) {
	for (var resourceName in this.schema.resources) {
		if (this.schema.resources.hasOwnProperty(resourceName)) {
			if (this.schema.resources[resourceName].resource.toLowerCase() === resource.toLowerCase()) {
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
Api.prototype.getActionMethodName = function(resourceClassName, action) {
	var actionMethodName = '';

	this.schema.resources[resourceClassName].actions.forEach(function(act) {
		if (StringUtils.isAString(act) && act.toLowerCase() === action.toLowerCase()) {
			actionMethodName = 'get' + StringUtils.capitalize(act);
		}
		else if (act.apiCall && act.apiCall.toLowerCase() === action.toLowerCase()) {
			actionMethodName = act.methodName;
		}
	});	

	return actionMethodName;
};

// Factory method for creating an API wrapper from a JSON schema definition.
//
// - @param {String} schema
// - @param {String} oauthkey
// - @param {String} oauthsecret
Api.build = function(schema, oauthkey /*optional*/, oauthsecret /*optional*/) {
	return new Api(schema, oauthkey, oauthsecret);
};


// Factory method for creating an API wrapper from a file
Api.buildFromFile = function(schemaPath, oauthkey /*optional*/, oauthsecret /*optional*/, format, logger) {
	// Blocking here but we should only ever do this once and the library is
	// unusable until it has read the schema.
	var schemaText = fs.readFileSync(schemaPath),
		schema = JSON.parse(schemaText.toString());

	return new Api(schema, oauthkey, oauthsecret, format, logger);
};

exports.Api = Api;

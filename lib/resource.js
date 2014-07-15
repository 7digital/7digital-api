'use strict';

var _ = require('lodash'),
	oauthhelper = require('./oauth-helper'),
	helpers = require('./helpers'),
	responseParser = require('./responseparser'),
	request = require('./request');


// A resource on the API, instances of this are used as the prototype of
// instances of each API resource.  This constructor will build up a method
// for each action that can be performed on the resource.
//
// The `options` argument should have the following properties:
//
// - *resourceDefinition - the definition of the resource and its actions from
//                         the schema definition.
// - *consumerkey* - the oauth consumerkey
// - *consumersecret* the oauth consumersecret
// - *schema* - the schema defintion
// - *format* - the desired response format
// - *logger* - for logging output
function Resource(options, schema) {
	this.logger = options.logger;
	this.resourceName = options.resourceDefinition.resource;
	this.host = schema.host;
	this.port = schema.port;
	this.api = options.api;
	this.version = schema.version;
	this.consumerkey = options.consumerkey;
	this.consumersecret = options.consumersecret;

	this.logger.silly('Creating constructor for resource: ' +
					this.resourceName);

	_.each(options.resourceDefinition.actions,
		function processAction(action) {
			this.createAction(action, this.request);
		}, this);
}

// Figure out the appropriate method name for an action on a resource on
// the API
//
// - @param {Mixed} - actionDefinition - Either a string if the action method
// name is the same as the action path component on the underlying API call
// or a hash if they differ.
// - @return {String}
Resource.prototype.chooseMethodName = function (actionDefinition) {
	var fnName;

	// Default the action name to getXXX if we only have the URL slug as the
	// action definition.
	if (_.isString(actionDefinition)) {
		fnName = 'get' + helpers.capitalize(actionDefinition);
	} else {
		fnName = actionDefinition.methodName;
	}

	return fnName;
};


// Utility method for creating the necessary methods on the Resource for
// dispatching the request to the 7digital API.
//
// - @param {Mixed} actionDefinition - Either a string if the action method
// name is the same as the action path component on the underlying API call
// or a hash if they differ.
Resource.prototype.createAction = function (actionDefinition) {
	var fnName = this.chooseMethodName(actionDefinition),
		action = typeof actionDefinition.apiCall === 'undefined' ?
			actionDefinition : actionDefinition.apiCall,
		httpMethod = (actionDefinition.method || 'GET'),
		url;

	this.logger.silly('Creating method: ' + fnName + ' for ' + action +
					' action with ' + httpMethod + ' HTTP verb');
	/*jshint validthis: true */
	function invokeAction(requestData, callback) {
		var self = this, endpointInfo = {
				host: this.host,
				port: this.port,
				version: this.version,
				authtype: actionDefinition.oauth,
				url: this.api.formatPath(this.resourceName, action)
			},
			credentials = {
				consumerkey: this.consumerkey,
				consumersecret: this.consumersecret
			};

		if (httpMethod.toLowerCase() === 'get') {
			// Add the default parameters to the request data
			_.defaults(requestData, this.defaultParams);
			request.get(endpointInfo, requestData, credentials, this.logger,
				this.cache, checkAndParse);
		}

		if (httpMethod.toLowerCase() === 'post') {
			request.post(endpointInfo, requestData, credentials, this.logger,
				checkAndParse);
		}

		function checkAndParse(err, res) {
			if (err) {
				return callback(err);
			}

			return responseParser.parse(res, {
				format: self.format,
				logger: self.logger
			}, callback);
		}
	}

	invokeAction.action = action;
	this[fnName] = invokeAction;
};

module.exports = Resource;

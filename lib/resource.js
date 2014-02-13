var underscore = require('underscore'),
	api = require('./api'),
	noopCache = require('./noop-cache'),
	oauthhelper = require('./oauth-helper'),
	helpers = require('./helpers'),
	responseParser = require('./responseparser'),
	request = require('./request');

// A resource on the API, this class will build up a method for each action
// that can be performed on the resource.
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
function Resource(options) {
	var apiDetails, clientOptions;

	this.format = options.format;
	this.logger = options.logger;
	this.cache = options.cache || noopCache;
	this.resourceName = options.resourceDefinition.resource;
	this.host = options.schema.host;
	this.port = options.schema.port;
	this.api = options.api;
	this.version = options.schema.version;
	this.consumerkey = options.consumerkey;
	this.consumersecret = options.consumersecret;

	this.logger.silly('Creating constructor for resource: ' +
		this.resourceName);

	apiDetails = {
		host: this.host,
		version: this.version,
		port: this.port
	};

	clientOptions = {
		logger: this.logger,
		format: this.format,
		cache: this.cache,
		consumerkey: this.consumerkey,
		consumersecret: this.consumersecret
	};

	underscore.each(options.resourceDefinition.actions,
		function processAction(action) {
			var fnName;
			action.resourceName = this.resourceName;
			fnName = chooseMethodName(action);
			this[fnName] = createAction(apiDetails, action, clientOptions);
		}, this);
}

// Figure out the appropriate method name for an action on a resource on
// the API
//
// - @param {Mixed} - actionDefinition - Either a string if the action method
// name is the same as the action path component on the underlying API call
// or a hash if they differ.
// - @return {String}
function chooseMethodName(actionDefinition) {
	var fnName;

	// Default the action name to getXXX if we only have the URL slug as the
	// action definition.
	if (underscore.isString(actionDefinition)) {
		fnName = 'get' + helpers.capitalize(actionDefinition);
	} else {
		fnName = actionDefinition.methodName;
	}

	return fnName;
}

// Utility method for creating the necessary methods on the Resource for
// dispatching the request to the 7digital API.
//
// - @param {Mixed} actionDefinition - Either a string if the action method
// name is the same as the action path component on the underlying API call
// or a hash if they differ.
function createAction(apiDetails, actionDefinition,
	clientOptions) {

	var action = typeof actionDefinition.apiCall === 'undefined' ?
			actionDefinition : actionDefinition.apiCall,
		httpMethod = (actionDefinition.method || 'GET'),
		endpointInfo = {
			host: apiDetails.host,
			port: apiDetails.port,
			version: apiDetails.version,
			authtype: actionDefinition.oauth,
			httpMethod: actionDefinition.method || 'GET',
			url: api.formatApiPath(apiDetails.version,
				actionDefinition.resourceName, action)
		},
		credentials = {
			consumerkey: clientOptions.consumerkey,
			consumersecret: clientOptions.consumersecret
		}, url, invoker;

	invoker = createActionInvoker(endpointInfo, credentials, clientOptions);
	invoker.action = action;


	invoker.action = action;
	return invoker;
}

function createActionInvoker(endpointInfo, credentials, clientOptions) {
	return function invokeAction(requestData, callback) {
		function checkAndParse(err, res) {
			if (err) {
				return callback(err);
			}

			return responseParser.parse(res, {
				format: clientOptions.format,
				logger: clientOptions.logger
			}, callback);
		}

		if (endpointInfo.httpMethod.toLowerCase() === 'get') {
			request.get(endpointInfo, requestData, credentials,
				clientOptions.logger, clientOptions.cache, checkAndParse);
		}
		if (endpointInfo.httpMethod.toLowerCase() === 'post') {
			request.post(endpointInfo, requestData, credentials,
				clientOptions.logger, checkAndParse);
		}
	};
}

module.exports = Resource;

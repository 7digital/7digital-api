var underscore = require('underscore'),
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
	this.format = options.format;
	this.logger = options.logger;
	this.resourceName = options.resourceDefinition.resource;
	this.host = options.schema.host;
	this.port = options.schema.port;
	this.api = options.api;
	this.version = options.schema.version;
	this.consumerkey = options.consumerkey;
	this.consumersecret = options.consumersecret;

	this.logger.silly('Creating constructor for resource: ' +
					this.resourceName);

	underscore.each(options.resourceDefinition.actions,
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
	if (underscore.isString(actionDefinition)) {
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
	var self = this,
		fnName = this.chooseMethodName(actionDefinition),
		action = typeof actionDefinition.apiCall === 'undefined' ?
			actionDefinition : actionDefinition.apiCall,
		httpMethod = (actionDefinition.method || 'GET'),
		url;

	this.logger.silly('Creating method: ' + fnName + ' for ' + action +
					' action with ' + httpMethod + ' HTTP verb');
	function invokeAction(requestData, callback) {
		var endpointInfo = {
				host: this.host,
				port: this.port,
				version: this.version,
				authtype: actionDefinition.oauth,
				url: self.api.formatPath(this.resourceName, action)
			},
			credentials = {
				consumerkey: this.consumerkey,
				consumersecret: this.consumersecret
			};

		function checkAndParse(err, res) {
			if (err) {
				return callback(err);
			}

			return responseParser.parse(res, {
				format: self.format,
				logger: self.logger
			}, callback);
		}

		if (httpMethod.toLowerCase() === 'get') {
			request.get(endpointInfo, requestData, credentials, this.logger,
				this.cache, checkAndParse);
		}
		if (httpMethod.toLowerCase() === 'post') {
			request.post(endpointInfo, requestData, credentials, this.logger,
				checkAndParse);
		}
	}

	invokeAction.action = action;
	this[fnName] = invokeAction;
};

module.exports = Resource;

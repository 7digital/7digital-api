var underscore = require('underscore'),
	oauthhelper = require('./oauth-helper'),
	helpers = require('./helpers'),
	ResponseParser = require('./responseparser'),
	Request = require('./request');

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
	var fnName = this.chooseMethodName(actionDefinition),
		action = typeof actionDefinition.apiCall === 'undefined' ?
			actionDefinition : actionDefinition.apiCall,
		httpMethod = (actionDefinition.method || 'GET'),
		url;

	this.logger.silly('Creating method: ' + fnName + ' for ' + action +
					' action with ' + httpMethod + ' HTTP verb');
	this[fnName] = function (params, callback) {
		var parser = new ResponseParser({
				format: this.format,
				logger: this.logger
			}),
			request = new Request({
				host: this.host,
				version: this.version,
				consumerkey: this.consumerkey,
				consumersecret: this.consumersecret,
				logger: this.logger,
				format: this.format,
				authtype: actionDefinition.oauth
			});

		// Dispatch the request to the API binding the request parser to the
		// callback when the response returns.
		url = request.formatPath(this.resourceName, action);
		request[httpMethod.toLowerCase()](url, params,
			underscore.bind(parser.parse, parser, callback));
	};
};

module.exports = Resource;

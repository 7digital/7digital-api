var underscore = require('underscore'),
	helpers = require('./helpers'),
	ResponseParser = require('./responseparser'),
	APIRequest = require('./apirequest').APIRequest;

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

	this.logger.info('Creating constructor for resource: ' +
					this.resourceName);

	underscore.each(options.resourceDefinition.actions,
		function processAction(action) {
			this.createAction(action, this.request);
		}, this);
}

// Utility method for creating the necessary methods on the Resource for
// dispatching the request to the 7digital API.
//
// - @param {Mixed} actionDefinition - Either a string if the action method
// name is the same as the action path component on the underlying API call
// or a hash if they differ.
Resource.prototype.createAction = function (actionDefinition) {
	var fnName;

	// Default the action name to getXXX if we only have the URL slug as the
	// action definition.
	if (underscore.isString(actionDefinition)) {
		fnName = 'get' + helpers.capitalize(actionDefinition);
	} else {
		fnName = actionDefinition.methodName;
		actionDefinition = actionDefinition.apiCall;
	}

	this.logger.info('Creating method: ' + fnName + ' for action: ' +
					actionDefinition);
	this[fnName] = function (params, callback) {
		var request = new APIRequest({
				host: this.host,
				version: this.version,
				consumerkey: this.consumerkey,
				consumersecret: this.consumersecret,
				logger: this.logger,
				format: this.format
			}),
			parser = new ResponseParser({
				format: this.format,
				logger: this.logger
			});

		this.logger.info('Dispatching request to ' +
						this.resourceName + '/' + actionDefinition);
		// Dispatch the request to the API binding the request parser to the
		// callback when the response returns.
		request.get(this.resourceName, actionDefinition, params,
			underscore.bind(parser.parse, parser, callback));
	};
};

module.exports = Resource;

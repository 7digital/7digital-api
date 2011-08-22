var helpers = require('./helpers'),
	underscore = require('underscore');

// Utility method for creating the necessary methods on the
// resource class for calling through to the API.
//
// - @param {Mixed} apiCallDefinition - Either a string if the
// action method name is the same as the action path component
// on the underlying API call or a hash if they differ.
// - @param {APIRequest} apiRequest - The request
module.exports.create = function (apiCallDefinition, apiRequest) {
	var fnName;

	if (underscore.isString(apiCallDefinition)) {
		fnName = 'get' + helpers.capitalize(apiCallDefinition);
	} else {
		fnName = apiCallDefinition.methodName;
		apiCallDefinition = apiCallDefinition.apiCall;
	}

	return function (params, callback) {
		var self = this;

		this.doGetRequest(apiCallDefinition, params,
			underscore.bind(self.parseResponse, self, callback));
	};
};

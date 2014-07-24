'use strict';

var _ = require('lodash');

function templateParams(url) {
	return url.match(/:([^/]+)/g);
}

function template(url, params) {
	var templated = url;
	var keys = _.keys(params);
	var loweredKeys = _.map(keys, function (key) {
		return key.toLowerCase();
	});
	var keyLookup = _.zipObject(loweredKeys, keys);

	_.each(templateParams(url), function replaceParam(param) {
		var normalisedParam = param.toLowerCase().substr(1);

		if (!keyLookup[normalisedParam]) {
			throw new Error('Missing ' + normalisedParam);
		}

		templated = templated.replace(param,
			params[keyLookup[normalisedParam]]);
		delete params[keyLookup[normalisedParam]];
	});

	return templated;
}

module.exports = exports = {
	templateParams: templateParams,
	template: template
};


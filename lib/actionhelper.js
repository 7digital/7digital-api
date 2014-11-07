'use strict';

var _ = require('lodash');

// Given a url extracts any named template parameters beginning with a colon.
// E.g. /foo/:bar/baz/:quux --->  [ 'bar', 'quux' ]
//
// @param {String} url - the url to parse
// @return {Array} an array of named parameters
function templateParams(url) {
	return url.match(/:([^/]+)/g);
}

// Given a url and some parameters replaces all named parameters with those
// supplied.
//
// @param {String} url - the url to be modified
// @param {Object} params - a hash of parameters to be put in the URL
// @return {String} The url with the parameters replaced
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


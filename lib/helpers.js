'use strict';

exports.padComponent = function (component) {
	return component <= 9 ? '0' + component : '' + component;
};

// Converts a date to a string in YYYYMMDD format
//
// - @param {Date} theDate
// - @return {String} The formatted date
exports.toYYYYMMDD = function (theDate) {
	var month = this.padComponent(theDate.getMonth() + 1);

	return theDate.getUTCFullYear() +
			month +
			this.padComponent(theDate.getDate()) +
			'';
};

// Capitalises the first character of a string
//
// - @param {String} str The string to capitalise
// - @return {String} The capitalised string
exports.capitalize = function (str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
};
//
// Determines the path for a given action on a resource
//
// - @param {String} prefix
// - @param {String} resource
// - @param {String} action
exports.formatPath = function formatPath(prefix, resource, action) {
	var requestPath = '/' + (prefix ? prefix + '/' : '') + resource;

	if (action !== '') {
		requestPath += '/' + action;
	}

	return requestPath;
};

"use strict";

exports.StringUtils = {

	// Capitalises the first character of a string
	//
	// - @param {String} str - the string to capitalise
	//
	// - @return {String} The capitalised string
	capitalize: function(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	},

	// Tests whether the argument passed is a string
	//
	// - @param {String} str - the object to test
	//
	// - @return {Boolean}
	isAString: function(str) {
		return typeof str === 'string';
	}

};

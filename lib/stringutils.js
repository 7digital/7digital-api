"use strict";

exports.StringUtils = {

	capitalize: function(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	},

	isAString: function(str) {
		return	typeof str === 'string';
	}

};
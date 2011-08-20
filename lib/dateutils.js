"use strict";


exports.DateUtils = {

	padComponent: function(component) {
		return component <= 9 ? '0' + component : '' + component;
	},

	// Converts a date to a string in YYYYMMDD format
	//
	// - @param {Date} theDate
	// - @return {String} the formatte date
	toYYYYMMDD: function(theDate) {
		var month = this.padComponent(theDate.getMonth() + 1);
		
		return theDate.getUTCFullYear()	+ 
				month + 
				this.padComponent(theDate.getDate()) + 
				'';
	},

};

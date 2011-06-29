"use strict";

exports.DateUtils = {

	padComponent: function(component) {
		return component <= 9 ? '0' + component : '' + component;
	},

	toYYYYMMDD: function(theDate) {
		var month = this.padComponent(theDate.getMonth() + 1);
		
		return theDate.getUTCFullYear()	+ 
				month + 
				this.padComponent(theDate.getDate()) + 
				'';
	},

	isDate: function(obj) {
		return (typeof(obj) === 'date')	? 
				true : 
				(typeof(obj) === 'object') ? 
					obj.constructor.toString().match(/date/i) !== null : 
					false;
	}

};

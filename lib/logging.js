"use strict";

var Logger = function(config) {
	if (config.debug === true) {
		return {
			log: function(thing) {
				console.log(thing);	
			}
		};
	} else {
		return {
			log: function() {
			}
		};
	}
};

exports.Logger = Logger;

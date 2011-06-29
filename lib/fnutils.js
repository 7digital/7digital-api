"use strict";

exports.FnUtils = {

	curry: function(fn) {
		var slice = Array.prototype.slice,
			args = slice.apply(arguments, [1]);

		return function() {
			return fn.apply(null, args.concat(slice.apply(arguments)));
		};
	},

	bind: function(ctx, fn) {
		return function() {
			fn.apply(ctx, arguments); 
		};
	}

};

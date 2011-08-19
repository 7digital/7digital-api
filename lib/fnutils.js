"use strict";

exports.FnUtils = {
	// Partial function application.  Curries the supplied function
	// with the remaining arguments.
	//
	// - @param {Function} fn - the function to curry
	curry: function(fn) {
		var slice = Array.prototype.slice,
			args = slice.apply(arguments, [1]);

		return function() {
			return fn.apply(null, args.concat(slice.apply(arguments)));
		};
	},

	// Binds a function to the provided context argument.
	//
	// - @param {Object} ctx - the value of this inside the function
	// - @param {Function} fn - the function to bind
	bind: function(ctx, fn) {
		return function() {
			fn.apply(ctx, arguments); 
		};
	}

};

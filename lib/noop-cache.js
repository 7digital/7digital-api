// A function that takes a variable number of arguments the last of which is
// a callback and calls the callback with no arguments on the next tick.
function asyncNoop() {
	var args = [].slice.call(arguments);
	var cb = args.pop();

	process.nextTick(cb);
}

// Used as the default cache for the API client requests.
module.exports = exports = {
	// Fake get that does nothing
	get: asyncNoop,
	// Fake set that does nothing
	set: asyncNoop
};

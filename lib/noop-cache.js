function asyncNoop() {
	var args = [].slice.call(arguments);
	var cb = args.pop();

	process.nextTick(cb);
}

module.exports = exports = {
	get: asyncNoop,
	set: asyncNoop
};

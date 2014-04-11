var config = require('../config');

// Makes a logger function that formats messages sensibly and logs to either
// stdout or stderr.
//
// - @param {String} level - the log level.
// - @param {String} method - the method on the console object to call.
// - @return {Function} - the logging function.
function makeLogger(level, method) {
	// The logger function to return takes a variable number of arguments
	// and formats like console.log
	function logger() {
		var args = [].slice.call(arguments);
		var format = level.toUpperCase() + ': (api-client) ' + args.shift();
		var logArgs = [format].concat(args);
		return console[method].apply(console, logArgs);
	}

	if (config.debug) {
		return logger;
	} else {
		return (level === 'warn' || level === 'error')
			? logger
			: function() {};
	}
}

module.exports = {
	silly: makeLogger('silly', 'log'),
	verbose: makeLogger('verbose', 'log'),
	info: makeLogger('info', 'log'),
	http: makeLogger('http', 'log'),
	warn: makeLogger('warn', 'log'),
	error: makeLogger('error', 'error')
};

var config = require('../config');

function makeLogger(level, method) {
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

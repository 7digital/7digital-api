var winston = require('winston');

// Uses winston logger with npm levels and the console transport
// this is the default logger used by the API wrapper, but can be
// overriden in the configuration options when requiring the
// package.
module.exports = new winston.Logger({
	transports: [
		new winston.transports.Console({
			colorize: true,
			timestamp: true
		})
	]
});


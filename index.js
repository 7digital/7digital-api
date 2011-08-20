var config = require('./config').Config,
	_ = require('underscore');

module.exports = require('./lib/api').Api.buildFromFile(config);

module.exports.configure = function(options) {
	if (typeof options === "undefined") {
		return;
	}

	_.defaults(options, config);
	
	return require('./lib/api').Api.buildFromFile(options);
};

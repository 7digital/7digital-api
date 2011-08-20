var config = require('./config').Config,
	_ = require('underscore');

module.exports = require('./lib/api').Api.buildFromFile(config);

module.exports.configure = function(options) {
	options = options || {};

	_.defaults(options, config);

	return require('./lib/api').Api.buildFromFile(options);
};

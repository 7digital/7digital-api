var config = require('./config'),
	underscore = require('underscore');

module.exports = require('./lib/api').Api.buildDefault();

module.exports.configure = function (options) {
	options = options || {};

	underscore.defaults(options, config);
	if (options.schema) {
		return require('./lib/api').Api.build(options);
	}

	return require('./lib/api').Api.buildFromFile(options);
};

module.exports.oauth = require('./lib/oauth-helper');
module.exports.schema = require('./assets/7digital-api-schema');

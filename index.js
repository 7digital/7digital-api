var config = require('./config').Config,
	prop;

module.exports = require('./lib/api').Api.buildFromFile(config);

module.exports.configure = function(options) {
	var prop;

	if (typeof options === "undefined") {
		return;
	}

	for (prop in config) {
		if (!options.hasOwnProperty(prop)) {
			options[prop] = config[prop];
		}
	}
	
	return require('./lib/api').Api.buildFromFile(options);
};

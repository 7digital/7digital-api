'use strict';

var config = require('./config');
var defaultSchema = require('./assets/7digital-api-schema');
var _ = require('lodash');

module.exports = require('./lib/api').Api.buildDefault();

module.exports.configure = function (options, schema) {
	options = options || {};
	schema = schema || defaultSchema;

	_.defaults(options, config);

	return require('./lib/api').Api.build(options, schema);
};

module.exports.schema = require('./assets/7digital-api-schema');

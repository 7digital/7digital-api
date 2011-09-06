var xml2js = require('../vendor/node-xml2js/lib/xml2js');

// Tidies up and optionally parses the XML API response
//
// The `options` argument should contain the following properties:
//
// - *format* - The desired response format
// - *logger* - An instance of {Winston.Logger} for output
//
// - @param {Object} options
// - @constructor
function ResponseParser(options) {
	this.format = options.format;
	this.logger = options.logger;
}

// Callback for parsing the XML response return from the API
// and converting it to JSON and handing control back to the
// caller.
//
// - @param {Function} callback - the caller's callback
// - @param {String} response - the XML response from the API
ResponseParser.prototype.parse = function (callback, err, response) {
	var parser;

	if (err) {
		callback(err);
		return;
	}

	console.dir(arguments);

	if (this.format === 'XML') {
		callback(null, response);
		return;
	}

	parser = new xml2js.Parser();

	// Check the request was authorised
	if (response.statusCode === 401) {
		callback(response);
		return;
	}

	console.log(response);
	this.logger.info('Parsing XML response from API');
	parser.on('end', function (result) {
		// Manually remove the xml namespace bits
		delete result['xmlns:xsi'];
		delete result['xsi:noNamespaceSchemaLocation'];

		if (result.status === 'error') {
			callback(result.error);
		}
		else {
			callback(null, result);
		}
	});

	parser.parseString(response + '');
};

module.exports = ResponseParser;

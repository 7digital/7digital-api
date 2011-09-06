// Require the API wrapper, if you have npm installed it this would be:
//     var api= require('7digital-api');
var api = require('../index'),
	tags = new api.Tags();

// Make a request using the wrapper and process the result
tags.all({}, function processTags(err, data) {
	if (err) {
		throw new Error(err);
	}

	console.dir(data);
});

// Require the API wrapper, if you have npm installed it this would be:
//     var api= require('7digital-api');
var api = require('../index'),
	artists = new api.Artists();

// Make a request using the wrapper and process the result
artists.getReleases({ artistid: 1 }, function processReleases(err, data) {
	if (err) {
		throw new Error(err);
	}

	console.dir(data);
});

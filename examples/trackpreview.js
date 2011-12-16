// Require the API wrapper, if you have npm installed it this would be:
//     var api= require('7digital-api');
var api = require('../index'),
	tracks = new api.Tracks();

// Make a request using the wrapper and process the result
tracks.getPreview({ trackId: 12345 }, function processPreview(err, data) {
	if (err) {
		throw new Error(err);
	}

	console.dir(data);
});

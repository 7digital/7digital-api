var config,
	api,
	artists;

config = {
	consumerkey: 'YOUR_KEY_HERE',
	consumersecret: 'YOUR_SECRET_HERE',
	format: 'json'
};

// Require the API wrapper, if you have npm installed it this would be:
//     var api= require('7digital-api');
api = require('../index').configure(config);
artists = new api.Artists();

// Make a request using the wrapper and process the result
artists.getReleases({ artistid: 1 }, function (err, data) {
	console.dir(data);
});

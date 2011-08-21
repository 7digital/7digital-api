var config,
	api,
	artists;

config = {
	consumerkey: 'YOUR_KEY_HERE',
	consumersecret: 'YOUR_SECRET_HERE',
	format: 'json'
};

api = require('../index').configure(config);
artists = new api.Artists();

artists.getReleases({ artistid: 1 }, function (err, data) {
	console.dir(data);
});

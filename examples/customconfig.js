var	config,
	api,
	artists;

config = {
	oauthkey: 'YOUR_KEY_HERE',
	oauthsecret: '',
	format: 'json'
};

api = require('../main').configure(config);
artists = new api.Artists();

artists.getReleases({ artistid: 1 }, function(err, data) {
	console.dir(data);
});

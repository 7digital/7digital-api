var	config,
	api,
	artists;

config = {
	oauthkey: 'MY_KEY_HERE',
	oauthsecret: '',
};

api = require('../main').with(config);
artists = new api.Artists()

artists.getReleases({ artistid: 1 }, function(err, data) {
	console.dir(data);
});	

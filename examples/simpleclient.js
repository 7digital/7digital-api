var api = require('../index'),
	artists = new api.Artists();

artists.getReleases({ artistid: 1 }, function processReleases(err, data) {
	if (err) {
		throw new Error(err);
	}

	console.dir(data);
});

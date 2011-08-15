var	api = require('../index'),
	artists = new api.Artists();
	
artists.getReleases({ artistid: 1 }, function(err, data) {
	console.dir(data);
});	

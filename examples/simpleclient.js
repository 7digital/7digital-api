var config = require('../config').Config,
	Path = require('path'), 
	api = require('../lib/api').Api.buildFromFile(Path.join(__dirname, '../', config.schemapath), config.oauthkey, config.oauthsecret),
	artists = new api.Artists();
	
artists.getReleases({ artistid: 1 }, function(err, data) {
	console.dir(data);
});	

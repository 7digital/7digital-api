 var config = require('./config').Config,
	api = require('./lib/api').Api.buildFromFile(__dirname + '/lib/api.json', config.oauthkey, config.oauthsecret),
	prop;

for (prop in api) {
	if (api.hasOwnProperty(prop)) {
		exports[prop] = api[prop]; 
	}
}

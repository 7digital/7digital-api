 var api = require('./lib/api').Api.buildFromFile(__dirname + '/lib/api.json'),
	prop;

for (prop in api) {
	if (api.hasOwnProperty(prop)) {
		exports[prop] = api[prop]; 
	}
}

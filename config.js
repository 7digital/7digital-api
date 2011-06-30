exports.Config = {
	/**
	* Path to the json file defining the remote api actions and their mappings
	* onto the wrapper. 
	*
	* @type string
	*/
	schemapath: 'lib/api.json',
	/**
	* Your API consumer key for accessing oauth secured endpoints
	* see http://api.7digital.com/1.2/static/documentation/7digitalpublicapi.html#Introduction
	*
	* @type string
	*/
	oauthkey: 'YOUR_KEY_HERE',
	/**
	* Your oauth consumer secret for signing oauth secured request urls.
	*
	* @type string
	*/
	oauthsecret: '',
	/**
	* Enables verbose logging to the console of all api requests and responses when set to true
	*
	* @type boolean
	*/
	debug: true
};

Node.js API Wrapper
===================

![7digital](http://cdn.7static.com/static/img/logo/7digital-GB.gif)

Current head build status:

[![Build Status](http://travis-ci.org/raoulmillais/node-7digital-api.png)](http://travis-ci.org/raoulmillais/node-7digital-api)

About 7digital
==============

7digital.com is an online music store operating in over 16 countries and offering more than 11 million high quality DRM free MP3s (320kbps) from all major labels and wide range of idependent labels and distributors. 7digital API will give you access to the full catalogue including high quality album art, 30s preview clips for all tracks, commissions on sales, integrated purchasing and full length streaming. More details at [developer.7digital.net](http://developer.7digital.net/)

WHAT IS THIS?
=============

A serverside javascript wrapper round the 7digital API which returns the responses parsed
into JavaScript objects.  Full code documentation can be found [here](http://raoulmillais.github.com/node-7digital-api/api.html)

INSTALLATION
============

The easiest way to use this wrapper is to install it via [npm](http://npmjs.org/)

    npm install 7digital-api

or globally

    sudo npm install -g 7digital-api

Then you can install via npm as usual (for npm >=1.0)

    npm install

USAGE
=====

See the examples folder for examples of how to use this.  If you have included 7digital-api in
your dependencies in the package.json file, you can use the like so:

    var api = require('7digital-api'),
        artists = new api.Artists();
    
    artists.getReleases({ artistid: 1 }, function(err, data) {
        console.dir(data);
    });

If you need to supply your own config or want XML responses, you do so like this:

    var api, artists;

    api = require('7digital-api').configure({
        format: 'XML',
        oauthkey: 'MY_KEY_HERE',
        oauthsecret: 'MY_SECRET_HERE',
    });
    
    artists = new api.Artists();
    
    artists.getReleases({ artistid: 1 }, function(err, data) {
	    console.dir(data);
    });	

See oauth.js in the examples folder for an example of how to acquire an oauth
access token to access any of the protected endpoints.


*The bundled OAuth module must be used in place of a standard OAuth wrapper*

    require('7digital-api').oauth,

This is to ensure the tokens are correctly parsed from the XML response.

See [developer.7digital.net](http://developer.7digital.net/) for full details of the API
endpoints and the parameters they accept.

To run the tests:

    npm test

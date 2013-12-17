![7digital](http://i.imgur.com/StUnvCy.png?1)
Node.js API Client
==================
Current head build status:

[![Build Status](https://travis-ci.org/raoulmillais/node-7digital-api.png?branch=master)](http://travis-ci.org/raoulmillais/node-7digital-api)

About 7digital
==============

7digital.com is an online music store operating in over 16 countries and offering more than 11 million high quality DRM free MP3s (320kbps) from all major labels and wide range of idependent labels and distributors. 7digital API will give you access to the full catalogue including high quality album art, 30s preview clips for all tracks, commissions on sales, integrated purchasing and full length streaming. More details at [developer.7digital.net](http://developer.7digital.net/)

WHAT IS THIS?
=============

A serverside javascript wrapper round the 7digital API which returns the responses parsed
into JavaScript objects.  Full code documentation can be found [here](http://raoulmillais.github.com/node-7digital-api/api.html)

INSTALLATION
============

[![NPM](https://nodei.co/npm/7digital-api.png?downloads=true)](https://nodei.co/npm/7digital-api/)

Install it via [npm](http://npmjs.org/)

    npm install --save 7digital-api

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
        consumerkey: 'MY_KEY_HERE',
        consumersecret: 'MY_SECRET_HERE',
    });
    
    artists = new api.Artists();
    
    artists.getReleases({ artistid: 1 }, function(err, data) {
	    console.dir(data);
    });	

See oauth.js in the examples folder for an example of how to acquire an oauth
access token to access any of the protected endpoints.


*The bundled OAuth module must be used in place of a standard OAuth client*

    require('7digital-api').oauth,

This is to ensure the tokens are correctly parsed from the XML response.

See [developer.7digital.net](http://developer.7digital.net/) for full details of the API
endpoints and the parameters they accept.

To run the unit tests:

    npm test

To run the integration tests:

    npm install git+ssh://git@github.com:7digital/api-stub.git
    mocha spec-integration/

the oauth tests require `_7D_CONSUMER_KEY`, `_7D_CONSUMER_SECRET` and
`_7D_VOUCHER_CODE` to be set.

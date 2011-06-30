Node.js API Wrapper
===================

![7digital](http://cdn.7static.com/static/img/logo/7digital-GB.gif)


WHAT IS THIS?
=============

It is:

* A library for wrapping 3rd party RESTful APIs based on a JSON schema file in 
nodejs.
* A serverside javascript wrapper round the 7digital API

INSTALLATION
============

The easiest way to use this wrapper is to install it via [npm](http://npmjs.org/)

    npm install 7digital-api

or globally

    sudo npm install -g 7digital-api 

If you have a clean checkout of the code, you must update the git submodules before installing:

    git submodule update --init --recursive

Then you can install via npm as usual (for npm >=1.0)

    npm install  ../path/to/checkout

USAGE
=====

See the examples folder for examples of how to use this.  If you have included 7digital-api in
your dependencies in the package.json file, you can use the like so:

    var api = require('7digital-api'),
        artists = new api.Artists();
    
    artists.getReleases({ artistid: 1 }, function(err, data) {
        console.dir(data);
    });	

WHAT DOES THIS SUPPORT?
=======================

The 7digital wrapper currently only supports the portions of the API which
do not require OAUTH authentication.

To run the tests:

    cd spec && node specs.js

To run the json proxy and API explorer:

    node server.js
    curl http://localhost:3000/artist/details?artistid=1
    
Please note, This has only really been tested with recent versions of node (>=0.3.1).
If you have problems with older versions of node, please try upgrading.  You may want
to try [n](https://github.com/visionmedia/n) if you want to manage multiple versions
of node.


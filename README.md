WHAT IS THIS?
=============

It is:

* A library for wrapping 3rd party RESTful APIs based on a JSON schema file in 
nodejs.
* A serverside javascript wrapper round the 7digital API

USAGE
=====

You will need to manually install the dependencies.  This can be done easily using npm, 
check the packages.json for the most recent dependencies.

    npm link .

or (for npm >=1.0)

    npm install

You will also need to make sure you have pulled in the gitsubmodules.

    git submodule update --init  --recursive

The 7digital wrapper currently only supports the portions of the API which
do not require OAUTH authentication.

To run the tests:

    cd spec && node specs.js

To run the json proxy and API explorer:

    node server.js
    curl http://localhost:3000/artist/details?artistid=1
    
Please note, I have only really tested this on recent versions of node (0.3.1 - 
0.4.7 at the time of writing), so please file an issue if you have problems with 
other versions of node.


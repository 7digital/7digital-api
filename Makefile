SHELL = bash

test: check
	jessie spec/

check: docs
	readyjs readyjs.conf.js

docs:
	docco lib/*.js
	docco examples/oauth.js

.PHONY: test check docs


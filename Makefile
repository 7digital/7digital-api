SHELL = bash

test: check
	npm test

check:
	./node_modules/.bin/jshint lib/*.js examples/*.js

docs:
	./node_modules/.bin/docco {lib,examples}/*.js

.PHONY: test check docs


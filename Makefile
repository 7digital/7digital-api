SHELL = bash

test: check
	jessie spec/

check: docs
	jshint lib/*.js examples/*.js

docs:
	docco {lib,examples}/*.js

.PHONY: test check docs


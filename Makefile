SHELL = bash

test: check
	jessie spec/

check: docs
	readyjs readyjs.conf.js

docs:
	docco {lib,examples}/*.js

.PHONY: test check docs


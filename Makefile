SHELL = bash

test: check
	jessie spec/

check:
	readyjs readyjs.conf.js


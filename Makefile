SHELL:=bash
BUNDLE?=./node_modules/.bin/browserify
JSHINT?=./node_modules/.bin/jshint
DOCCO?=./node_modules/.bin/docco

define assert_no_local_changes
	@git --no-pager diff --exit-code --quiet ||                         \
		(echo "You must commit or stash your changes first" 1>&2 && \
		exit 1)
	@git --no-pager diff --exit-code --quiet --cached ||                \
		(echo "You must commit your staged changes first" 1>&2 &&   \
		exit 1)
endef

define assert_master_branch
	@git rev-parse --abbrev-ref HEAD                         \
		| grep 'master' > /dev/null 2>&1 ||              \
		(echo "You must be on the master branch" 1>&2 && \
		exit 1)
endef

define assert_all_changes_pushed
	test -z "`git rev-list @{upstream}.. -n 1`" ||               \
		(echo "You must push all your changes first" 1>&2 && \
		exit 1)
endef

define assert_is_owner
	npm --loglevel=warn owner ls |                          \
	awk '{print $1}' |                                      \
	grep "`npm whoami`" > /dev/null 2>&1 ||                 \
		(echo "You must be an owner to publish" 1>&2 && \
		exit 1)
endef

test: check
	@npm test

check:
	$(JSHINT) lib/*.js examples/*.js

bundle:
	$(BUNDLE) build.js > build/7digital.js

docs:
	$(DOCCO) --layout linear {lib,examples}/*.js

publish-check:
	$(assert_master_branch)
	$(assert_no_local_changes)


publish-docs: test docs publish-check
	git checkout gh-pages
	git pull --rebase origin gh-pages
	rm *.{html,css}
	rm -rf public
	cp -R docs/* .
	git add -A
	git commit -m "Publish docs"
	git push origin gh-pages
	git checkout master

publish: publish-docs
	test -n "$(version)" || (echo \
		"Supply a version: make publish version=x.x.x" && \
		exit 1)
	$(assert_is_owner)
	npm version $(version)
	git push origin master --tags
	npm publish



.PHONY: test check docs build publish-docs publish

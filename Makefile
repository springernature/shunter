# Group targets
all: deps lint lcov-levels
ci: lint lcov-levels

# Install dependencies
deps:
	@echo "> Installing dependencies"
	@npm install

# Run all linters
lint:
	@echo "> Linting javascript"
	@./node_modules/.bin/eslint **/*.js

# Run all tests
test: lcov-levels

# Run unit tests
test-server:
	@echo "> Running server-side unit tests"
	@./node_modules/.bin/mocha --opts ./tests/mocha.opts ./tests/server

test-cov:
	@echo "> Checking test coverage"
	@./node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- --opts ./tests/mocha.opts ./tests/server

lcov-levels: test-cov
	@echo "> Checking coverage levels"
	@./node_modules/.bin/istanbul check-coverage --statement 80 --branch 80 --function 80


.PHONY: test

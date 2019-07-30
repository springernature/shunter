# Group targets
all: deps lint test
ci: lint test

# Install dependencies
deps:
	@echo "> Installing dependencies"
	@npm install

# Run all linters
lint:
	@echo "> Linting javascript"
	@./node_modules/.bin/eslint '**/*.js'

# Run all tests
test:
	@echo "> Running server-side unit tests and checking test coverage"
	@./node_modules/.bin/nyc ./node_modules/.bin/mocha  --opts ./tests/mocha.opts ./tests/server

# Run unit tests
test-server:
	@echo "> Running server-side unit tests"
	@./node_modules/.bin/mocha --opts ./tests/mocha.opts ./tests/server


.PHONY: test

# Group targets
all: deps lint lcov-levels
ci: lint lcov-levels

# Install dependencies
deps:
	@echo "> Installing dependencies"
	@npm install

# Run all linters
lint: xo

# Lint JavaScript
xo:
	@echo "> Linting javascript"
	@./node_modules/.bin/xo

snyk:
	@./node_modules/.bin/snyk test --org=springernature

# Run all tests
test: lcov-levels

# Run unit tests
test-server:
	@echo "> Running server-side unit tests"
	@./node_modules/.bin/mocha --recursive --reporter spec --ui bdd ./tests/server

test-cov:
	@echo "> Checking test coverage"
	@./node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- --recursive --reporter spec --ui bdd ./tests/server

lcov-levels: test-cov
	@echo "> Checking coverage levels"
	@./node_modules/.bin/istanbul check-coverage --statement 80 --branch 80 --function 80


.PHONY: test

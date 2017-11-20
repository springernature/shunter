
# Color helpers
C_CYAN=\x1b[34;01m
C_RESET=\x1b[0m

# Group targets
all: deps lint lcov-levels
ci: lint lcov-levels

# Install dependencies
deps:
	@echo "$(C_CYAN)> installing dependencies$(C_RESET)"
	@npm install

# Run all linters
lint: xo

# Lint JavaScript
xo:
	@echo "$(C_CYAN)> linting javascript$(C_RESET)"
	@./node_modules/.bin/xo

snyk:
	@./node_modules/.bin/snyk test --org=springernature

# Run all tests
test: lcov-levels

# Run unit tests
test-server:
	@echo "$(C_CYAN)> running server-side unit tests$(C_RESET)"
	@./node_modules/.bin/mocha --recursive --reporter spec --ui bdd ./tests/server

test-cov:
	@echo "$(C_CYAN)> checking test coverage $(C_RESET)"
	@./node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- --recursive --reporter spec --ui bdd ./tests/server

lcov-levels: test-cov
	@echo "$(C_CYAN)> checking coverage levels $(C_RESET)"
	@./node_modules/.bin/istanbul check-coverage --statement 80 --branch 80 --function 80


.PHONY: test


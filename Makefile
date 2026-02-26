default: help

.PHONY: help
help: # Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done

.PHONY: build
build: # Build the TypeScript source.
	npm run build

.PHONY: test
test: # Run the test suite.
	npm test

.PHONY: lint
lint: # Type-check without emitting.
	npm run lint

.PHONY: ci
ci: # Run lint and tests (used by CI pipeline).
	$(MAKE) lint
	$(MAKE) test

.PHONY: dev
dev: # Start TypeScript compiler in watch mode. Alias 'workforest' to dev.
	npm run dev
	npm run link

.PHONY: install
install: build # Build and install the CLI globally.
	npm install -g .

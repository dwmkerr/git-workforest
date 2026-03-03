### Requirement: CI workflow runs on pull requests and main pushes
The system SHALL run a GitHub Actions CI workflow on every pull request targeting `main` and on every push to `main`.

#### Scenario: PR opened against main
- **WHEN** a pull request is opened or updated targeting the `main` branch
- **THEN** the CI workflow SHALL trigger and run lint and test steps

#### Scenario: Push to main
- **WHEN** a commit is pushed to the `main` branch
- **THEN** the CI workflow SHALL trigger and run lint and test steps

### Requirement: CI workflow runs lint check
The CI workflow SHALL run type-checking via `make lint` as a quality gate.

#### Scenario: Lint passes
- **WHEN** the CI workflow runs and `make lint` exits with code 0
- **THEN** the lint step SHALL pass

#### Scenario: Lint fails
- **WHEN** the CI workflow runs and `make lint` exits with a non-zero code
- **THEN** the lint step SHALL fail and the workflow SHALL report failure

### Requirement: CI workflow runs tests
The CI workflow SHALL run the test suite via `make test` as a quality gate.

#### Scenario: Tests pass
- **WHEN** the CI workflow runs and `make test` exits with code 0
- **THEN** the test step SHALL pass

#### Scenario: Tests fail
- **WHEN** the CI workflow runs and `make test` exits with a non-zero code
- **THEN** the test step SHALL fail and the workflow SHALL report failure

### Requirement: CI workflow installs dependencies
The CI workflow SHALL install project dependencies before running lint or test steps.

#### Scenario: Dependencies installed
- **WHEN** the CI workflow starts
- **THEN** it SHALL run `npm ci` to install dependencies from the lockfile

### Requirement: Makefile provides ci target
The Makefile SHALL provide a `ci` target that runs lint and test sequentially.

#### Scenario: Running make ci locally
- **WHEN** a developer runs `make ci`
- **THEN** the system SHALL run `make lint` followed by `make test`

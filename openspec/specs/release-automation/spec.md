### Requirement: Release Please creates release PRs
The system SHALL use Release Please to automatically create and maintain a release PR when conventional commits are pushed to `main`.

#### Scenario: Conventional commit pushed to main
- **WHEN** a commit with a conventional commit message (e.g., `feat:`, `fix:`) is pushed to `main`
- **THEN** Release Please SHALL create or update a release PR with the proposed version bump and changelog entry

#### Scenario: Non-conventional commit pushed
- **WHEN** a commit without a conventional commit prefix is pushed to `main`
- **THEN** Release Please SHALL not create or update a release PR for that commit

### Requirement: Release PR updates version and changelog
The release PR created by Release Please SHALL update `package.json` version and `CHANGELOG.md`.

#### Scenario: Release PR contents
- **WHEN** a release PR is created
- **THEN** it SHALL contain an updated `version` field in `package.json` and new entries in `CHANGELOG.md`

### Requirement: Merging release PR triggers npm publish
The system SHALL publish the package to npm when a Release Please release PR is merged.

#### Scenario: Release PR merged
- **WHEN** a Release Please release PR is merged to `main`
- **THEN** the workflow SHALL run `npm publish --provenance` to publish the package to npm

#### Scenario: Non-release PR merged
- **WHEN** a regular (non-release) PR is merged to `main`
- **THEN** the workflow SHALL NOT publish to npm

### Requirement: npm publish uses provenance
The npm publish step SHALL use the `--provenance` flag for supply chain attestation.

#### Scenario: Published package has provenance
- **WHEN** the package is published to npm
- **THEN** the publish command SHALL include `--provenance` and the workflow SHALL have `id-token: write` permission

### Requirement: Release workflow requires NPM_TOKEN secret
The release workflow SHALL use an `NPM_TOKEN` repository secret for npm authentication.

#### Scenario: NPM_TOKEN configured
- **WHEN** the release workflow runs the publish step and `NPM_TOKEN` is set
- **THEN** npm publish SHALL authenticate using the token

#### Scenario: NPM_TOKEN not configured
- **WHEN** the release workflow runs the publish step and `NPM_TOKEN` is not set
- **THEN** the publish step SHALL fail

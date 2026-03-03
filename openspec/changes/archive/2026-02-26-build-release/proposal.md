## Why

The CLI is feature-complete but has no CI pipeline or release automation. Contributors can't verify their changes pass tests before merging, and publishing to npm is a manual process prone to mistakes. Setting up GitHub Actions and Release Please enables automated quality gates and one-click releases.

## What Changes

- Add GitHub Actions CI workflow that runs lint and tests on PRs and pushes to main
- Add Release Please automation for changelog generation, version bumping, and npm publishing
- Add a `ci` npm script for the full lint+test pipeline
- Add npm provenance support for supply chain security

## Capabilities

### New Capabilities

- `ci-pipeline`: GitHub Actions workflow for linting and testing on PRs and main branch pushes
- `release-automation`: Release Please integration for automated changelog, versioning, and npm publish

### Modified Capabilities

None.

## Impact

- New files: `.github/workflows/ci.yaml`, `.github/workflows/release.yaml`
- New npm script: `ci` (runs lint + test sequentially)
- Requires `NPM_TOKEN` secret configured in GitHub repo settings for npm publish
- Requires npm provenance support (GitHub Actions OIDC)

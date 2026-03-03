## Context

The workforest CLI (TypeScript ESM, Node >=20) has a complete test suite (vitest) and type-checking (tsc --noEmit) but no CI or release automation. The Makefile already wraps `npm run build`, `npm test`, and `npm run lint`. The package is published to npm as `workforest`.

## Goals / Non-Goals

**Goals:**

- Automated lint + test on every PR and push to main
- Automated changelog, version bumps, and npm publishing via Release Please
- npm provenance attestation for published packages
- Simple, maintainable workflow files

**Non-Goals:**

- Multi-platform testing (macOS/Windows/Linux matrix) — start with ubuntu-latest only
- Multi-node-version matrix — start with Node 20 only (matches `engines` field)
- Docker or container publishing
- Code coverage reporting or badges

## Decisions

### Use `make ci` as the CI entry point

Run `make lint && make test` rather than calling npm scripts directly. The Makefile is already the project's task runner and adding a `ci` target keeps the workflow file thin. A new `ci` target in the Makefile chains lint and test.

**Alternative considered:** Running `npm run lint && npm test` directly in the workflow. Rejected because the Makefile already abstracts these and adding a `ci` target is useful locally too.

### Release Please v4 with manifest mode

Use `googleapis/release-please-action@v4` with the Node release type. Release Please creates a PR that bumps `package.json` version and updates `CHANGELOG.md`. Merging the PR triggers the publish step.

**Alternative considered:** Manual npm publish or semantic-release. Release Please is simpler, uses conventional commits (which this repo already follows), and produces human-reviewable release PRs.

### Single release workflow with conditional publish job

One workflow file `release.yaml` handles both the Release Please PR and the npm publish step. The publish job runs conditionally when Release Please creates a release (`releases_created` output). This avoids a separate workflow and keeps release logic together.

### npm provenance via `--provenance` flag

Enable `npm publish --provenance` in the publish step. This requires `id-token: write` permission in the GitHub Actions workflow and links the published package to its source commit.

### Separate CI and release workflows

`ci.yaml` runs on PRs and main pushes. `release.yaml` runs only on main pushes. This keeps concerns separated — CI is about quality gates, release is about versioning and publishing.

## Risks / Trade-offs

- **NPM_TOKEN secret required** → Document in README that the repo admin must add this secret before the first publish.
- **Release Please PR noise** → Each main merge updates the release PR. This is standard behavior and acceptable for a small project.
- **Tests require git** → The test suite creates real git repos in temp dirs. GitHub Actions runners have git installed by default, so this works without extra setup.
- **No lockfile caching initially** → Could add `actions/cache` for `node_modules` later if CI gets slow. For now `npm ci` on a small dependency tree is fast enough.

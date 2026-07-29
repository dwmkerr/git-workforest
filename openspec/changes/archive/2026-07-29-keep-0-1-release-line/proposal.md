## Why

Workforest is intentionally staying on the `0.1.x` release line, but the current pre-major flags still allow a historical `BREAKING CHANGE` commit to advance the release to `0.2.0`. The open Release Please PR is therefore proposing the wrong version despite normal feature commits being configured as patch bumps.

## What Changes

- Use Release Please's explicit `always-bump-patch` versioning strategy.
- Remove the overlapping pre-major bump flags that still permit minor releases.
- Require every automated release from `0.1.0` to remain on the `0.1.x` line until the versioning policy is deliberately changed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `release-automation`: Automated releases must use patch-only version increments while Workforest remains on the `0.1.x` line.

## Impact

- Updates `release-please-config.json` and normalizes the legacy `release-automation` spec structure for current OpenSpec tooling.
- Causes Release Please to recalculate the open release PR from `0.2.0` to `0.1.1` after this change reaches `main`.
- Breaking-change annotations remain visible in the changelog but do not advance the minor version.

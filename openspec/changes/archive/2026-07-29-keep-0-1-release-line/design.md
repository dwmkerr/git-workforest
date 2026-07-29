## Context

The manifest and package are at `0.1.0`, while the unreleased commit range contains a breaking-change footer. The current combination of `bump-minor-pre-major` and `bump-patch-for-minor-pre-major` makes ordinary features patch releases but still makes pre-1.0 breaking changes minor releases.

## Goals / Non-Goals

**Goals:**

- Keep all automated releases on `0.1.x` until the policy is deliberately changed.
- Express that policy with a single unambiguous Release Please setting.

**Non-Goals:**

- Remove breaking-change entries from the changelog.
- Rewrite historical commits or tags.
- Define the eventual criteria for moving to `0.2.0` or `1.0.0`.

## Decisions

### Use the `always-bump-patch` versioning strategy

Set the package's `versioning` option to `always-bump-patch`. This official Release Please strategy returns a patch update for every releasable commit set, including breaking changes.

Remove both pre-major flags. `bump-patch-for-minor-pre-major` affects feature commits but does not override breaking changes, while `bump-minor-pre-major` explicitly maps breaking changes to a minor bump. Keeping them alongside the explicit strategy would make the intended policy less clear.

**Alternative considered:** Add a one-time `Release-As: 0.1.1` footer. This can repair the current PR but does not prevent the same issue on later releases.

## Risks / Trade-offs

- **Breaking changes no longer communicate severity through the version number** → Preserve the breaking-change section in the generated changelog and change the strategy deliberately when the project is ready to advance the minor line.
- **The open release PR may retain stale state briefly after merge** → Wait for the next Release Please workflow run to force-update it before merging the release PR.

## Migration Plan

1. Merge the configuration change to `main`.
2. Confirm Release Please rewrites PR #52 from `0.2.0` to `0.1.1`.
3. Merge the updated release PR to publish the patch release.

Rollback by restoring the default versioning strategy if minor or major semantic bumps become desired.

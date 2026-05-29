## Why

Git users habitually type `ls` as a short form of `list` (e.g. many shells expose `ls` aliases, and several git porcelain commands tolerate short forms). Today `git forest ls` fails with an unknown-command error, which is jarring because every other workflow flag in this project is designed to "feel familiar to git users". Adding `ls` as an alias is a one-line ergonomic fix that closes a small but recurring papercut reported in issue #59.

## What Changes

- Add `ls` as a command alias for `git forest list`, alongside the existing `status` alias.
- `git forest ls` SHALL behave identically to `git forest list` (same output, same exit codes, same context-aware hints).
- Update the `list-command` spec to document `ls` as a recognised invocation.

This is non-breaking: it only widens the set of accepted command names.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `list-command`: extend the list command's invocation surface to include `ls` as an alias of `list` (in addition to the existing `status` alias).

## Impact

- `src/cli.ts`: add a second `.alias("ls")` call on the `list` command registration.
- `openspec/specs/list-command/spec.md`: add a requirement (via delta) that `ls` is a recognised alias.
- No changes to `src/commands/status.ts`, git operations, or configuration.
- No new dependencies; no migration; no user-visible behavioural change for existing invocations.

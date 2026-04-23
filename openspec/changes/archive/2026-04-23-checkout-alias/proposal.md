## Why

`git forest checkout` is the intuitive command for users coming from git, where `git checkout` is the standard way to switch branches. Currently only `git forest add` exists, which mirrors `git worktree add` but isn't discoverable for users expecting checkout semantics.

## What Changes

- Add `checkout` as an alias for the `add` command, matching the existing pattern used by `list`/`status` and `remove`/`delete`

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `add-command`: add `checkout` as a registered alias
- `default-usage`: update help output to show `checkout` alias

## Impact

- `src/cli.ts`: add `.alias("checkout")` to the `add` command registration
- Spec files for `add-command` and `default-usage` updated to document the alias

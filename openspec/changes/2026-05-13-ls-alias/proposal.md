## Why

`ls` is the universal short form for "list" — every shell user already types it dozens of times a day, and git itself uses `ls` shorthand throughout (`git ls-files`, `git ls-remote`, `git ls-tree`). Currently `git forest list` has `status` as an alias, but no two-letter form. Adding `ls` matches muscle memory and pairs with the existing `checkout` alias pattern.

## What Changes

- Add `ls` as an alias for the `list` command, alongside the existing `status` alias

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `list-command`: add `ls` as a registered alias
- `default-usage`: update help output to show `ls` alias

## Impact

- `src/cli.ts`: switch `list` from `.alias("status")` to `.aliases(["status", "ls"])`
- Spec files for `list-command` and `default-usage` updated to document the alias

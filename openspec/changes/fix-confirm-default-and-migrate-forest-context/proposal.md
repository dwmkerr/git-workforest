## Why

Two related bugs in confirmation flow and command context handling:

1. The `confirm()` helper treats any input other than `"n"` as confirmation — so pressing enter at a `(y/N)` prompt accepts the action even though the capital `N` signals the default should be no. Users hit this with `git forest migrate` and accidentally migrate when they meant to abort.

2. The `migrate` command only handles two contexts (`"repo"` and `"empty"`). When run from inside an existing forest it falls into the else branch and incorrectly prompts to clone a new repo. It should detect "already in a forest" and print the tree listing, matching the behaviour of `init` and `list`.

## What Changes

- `confirm()` accepts a `defaultYes: boolean` parameter. Empty input returns the default. Existing call sites update accordingly:
  - `clone` confirmation `(Y/n)` → `defaultYes: true` (unchanged behaviour)
  - `migrate` confirmation `(y/N)` → `defaultYes: false` (fixes bug 1)
- `migrate` command handles `context === "forest"` by printing "already a forest" and the tree listing, matching `init` (fixes bug 2).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `migrate-command`: handles forest context (already a forest) by listing trees instead of prompting to clone.
- `default-usage`: confirmation prompts respect their displayed default (`Y/n` defaults to yes, `y/N` defaults to no).

## Impact

- Code: `src/cli.ts` (confirm helper signature, migrate handler).
- No new dependencies.
- No behavioural change for `clone -y` or any non-interactive use.

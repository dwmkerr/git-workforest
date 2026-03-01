## Why

Running `git forest checkout <branch>` should check out a branch — creating a tree if needed and printing a `cd` suggestion. This replaces the `tree` command with something more intuitive that mirrors `git checkout`. Users don't need to think about whether a tree exists; `checkout` handles both cases.

## What Changes

- Add `checkout <branch>` command that finds an existing tree or creates one, then prints a `cd` suggestion
- Remove the `tree` command (replaced by `checkout`)
- Follow the same `cd` hint pattern used by `migrate`

## Capabilities

### New Capabilities
- `checkout-command`: Check out a branch by finding or creating its tree, then print a cd hint

### Modified Capabilities
- `tree-command`: Removed — replaced by `checkout`

## Impact

- New command registered in `src/cli.ts`, replacing `tree`
- New command module `src/commands/checkout.ts`
- Remove `src/commands/tree.ts` and its tests
- Update help text examples

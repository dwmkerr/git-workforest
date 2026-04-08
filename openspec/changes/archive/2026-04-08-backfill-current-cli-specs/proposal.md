## Why

`openspec/specs/` has drifted from the shipped CLI. PR #39 (e81c3a1) renamed `checkout`→`add` and `status`→`list` and added `remove`, but no openspec change was created to mirror the rename, and six prior changes in `openspec/changes/` were never archived. The result is that the specs describe commands that no longer exist (`checkout`, `tree`, `status`) and don't describe commands that do (`add`, `list`, `remove`, `init`). We need a single backfill so the specs become a truthful description of `main`, after which the new pre-push specguard hook can keep them honest.

## What Changes

- **BREAKING (spec-only)**: remove the stale `tree-command` and `status-command` specs from `openspec/specs/`. No code changes — these specs no longer match shipped behaviour.
- Add a new `add-command` spec describing `git forest add <branch>` (the renamed `checkout`).
- Add a new `list-command` spec describing `git forest list` (the renamed `status`).
- Add a new `remove-command` spec describing `git forest remove <branch>`, including the active-tree refusal with recovery hint, the `-f` force flag, the dirty-tree guard, and the empty-parent cleanup.
- Add a new `init-command` spec describing `git forest init` (context detection: forest / repo / empty).
- Refresh the `default-usage` spec so the `--help` example matches current command list.
- Discard the six unarchived pending changes in `openspec/changes/`:
  - `checkout-command` (superseded by the rename)
  - `checkout-and-status-fixes` (superseded — bug fixes are in code under new command names, scenarios get lifted into the new specs)
  - `command-docs-and-screenshots` (abandoned, 0 tasks)
  - `status-sort-and-indicators` (abandoned, 0 tasks)
  - `improve-migrate-preview` (rationale lifted into refreshed `migrate-command` spec where needed; the change is otherwise stale)
  - `init-command-and-docs` (rationale lifted into the new `init-command` spec)

This change is **pure paperwork**: no source code, tests, or behaviour changes. Specs should describe `main` exactly as it is today.

## Capabilities

### New Capabilities
- `add-command`: `git forest add <branch>` — finds an existing tree or creates a new worktree for a branch, prints a cd hint
- `list-command`: `git forest list` — lists trees in the current forest with active-branch and worktree indicators
- `remove-command`: `git forest remove <branch>` — removes a tree (worktree or fat clone), with active-tree and dirty-tree guards and parent cleanup
- `init-command`: `git forest init` — context-aware entry point that detects forest/repo/empty state

### Modified Capabilities
- `default-usage`: refresh the `--help` example output to match current commands (`clone`, `add`, `list`, `remove`, `migrate`, `init`)

## Impact

- **Specs**: `openspec/specs/tree-command/` and `openspec/specs/status-command/` deleted; four new spec directories created; `openspec/specs/default-usage/spec.md` updated.
- **Pending changes**: six directories under `openspec/changes/` deleted.
- **Code**: none.
- **Tests**: none.
- **Pre-push specguard hook**: after this lands, the hook should pass on a clean push since specs match code.

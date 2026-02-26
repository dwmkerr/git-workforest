## Why

The CLI is fully implemented (clone, tree, migrate, status, config, paths, git ops) but has no OpenSpec specs documenting the requirements. Adding baseline specs captures the existing behaviour so future changes can reference and modify them properly.

## What Changes

- No code changes — this is a documentation-only change
- Creates main specs for all existing capabilities

## Capabilities

### New Capabilities
- `clone-command`: clone a GitHub repo into a structured forest path with confirmation prompt
- `tree-command`: create a worktree or fat clone for a branch within a forest
- `migrate-command`: migrate an existing repo to forest layout or clone a new one interactively
- `status-command`: show trees in the current forest with active branch highlighting
- `config`: yaml-based configuration with zod validation and sensible defaults
- `forest-detection`: find the forest root by walking up the directory tree looking for `.workforest.yaml`
- `git-operations`: clone, worktree add, fat clone, branch detection, worktree detection

### Modified Capabilities
None.

## Impact

- No code impact — specs-only change
- Creates `openspec/specs/` directory with 7 capability specs

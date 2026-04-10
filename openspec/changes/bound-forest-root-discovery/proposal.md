## Why

`findForestRoot` walks up from cwd looking for any `.workforest.yaml`, but that same filename is also the global config file at `~/.workforest.yaml`. If a user runs `git forest list` from a directory with no closer marker, discovery walks up to `$HOME`, treats the global config as a forest root, and then recursively scans the entire home directory spawning a `git` subprocess per subdirectory — catastrophically slow and wrong.

The fix is to distinguish a forest marker from global config by content, not by filename, and to require the marker to carry the minimum information needed to recreate the forest from scratch: the remote URL.

## What Changes

- **BREAKING**: a `.workforest.yaml` file is only treated as a forest root marker if it contains a `remote:` key with the git remote URL. A file with only global-config keys (`reposDir`, `treeDir`, `fatTrees`, `verbose`) is ignored by `findForestRoot`.
- New required field in the forest-level `.workforest.yaml`: `remote: <git-url>`. This is the minimum needed to recreate the forest (`git clone <remote>` rebuilds the default tree; further trees come from `git worktree add`).
- `findForestRoot` stops traversal at `$HOME` and refuses to treat `$HOME` or `/` as a forest root even if a marker is present there. A clear error points the user at the likely cause (global config file conflict).
- `git forest init` / `git forest clone` / `git forest migrate` write the `remote:` key into the forest-level `.workforest.yaml` when creating or adopting a forest.
- Migration path for existing forests: discovery prints a clear error when it finds an empty/legacy `.workforest.yaml` without `remote:`, telling the user to run `git forest migrate` (or add the key manually) to upgrade.
- Unlocks a future `git forest clone` behaviour: given an empty directory containing only a `.workforest.yaml` with `remote:`, the tool can reconstruct the forest end-to-end.
- `findTrees` uses the marker's `remote:` as the authoritative origin URL. Commands that need the origin (e.g. `add` in fatTrees mode) read it from the marker instead of sniffing a child tree. Trees whose origin does not match the marker's `remote:` are excluded from listings.
- `scratch/` is added to the skip list in `findTrees` alongside `node_modules`, `.git`, `.worktrees`.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `forest-detection`: `findForestRoot` now requires the `remote:` key to accept a file as a forest marker, and halts traversal at `$HOME`. Returns the `remote` URL alongside the root path.
- `config`: documents the distinction between global config (`~/.workforest.yaml`, no `remote:`) and forest-level config (contains `remote:`). Adds the `remote` field to the schema as optional at the global level, required at the forest level.
- `list-command`: trees whose origin does not match the forest `remote:` are excluded from listings.
- `add-command`: reads origin URL from the forest marker's `remote:`, not from a child tree. Fixes wrong-repo clones when stray repos exist in the forest.
- `init-command`, `clone-command`, `migrate-command`: these commands SHALL write `remote:` into the forest-level `.workforest.yaml` they create.

## Impact

- Code: `src/paths.ts` (findForestRoot returns remote), `src/config.ts` (schema adds `remote`), `src/commands/status.ts` (filter trees by remote, skip `scratch/`), `src/commands/checkout.ts` (use marker remote), `src/commands/clone.ts`, `src/commands/migrate.ts` (all write `remote:`).
- Existing forests on disk: users must upgrade their forest marker. A clear error with a one-line fix is shown.
- No new dependencies.

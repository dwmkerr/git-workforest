## Context

The `buildMigratePreview` function in `src/commands/migrate.ts` currently reads the directory, lists files in a before/after format. The preview is noisy — it lists the same files twice. The caller in `cli.ts` prints the preview string followed by a confirmation prompt.

## Goals / Non-Goals

**Goals:**
- Replace preview with a concise tree diagram showing the structural change
- Show the forest concept (main branch + future worktree branches)
- Note that migration is non-destructive (one folder rename)
- Use dimmed `#` comments for annotations via chalk

**Non-Goals:**
- Detecting existing worktrees (future idea, tracked in ideas.md)
- Changing the migration logic itself
- Changing the confirmation prompt wording

## Decisions

1. **Remove file listing entirely** — `buildMigratePreview` no longer reads directory contents. It only needs the repo folder name and branch name. This simplifies the function signature and removes filesystem I/O from preview generation.

2. **Accept repo name as parameter** — the function needs the repo directory name (e.g. `gdog`) to show in the tree. The caller already has `gitRoot` available, so we pass `path.basename(gitRoot)`.

3. **Return plain strings, apply chalk in caller** — `buildMigratePreview` returns a plain-text preview string. Chalk formatting (dimming `#` comments) is applied in `cli.ts` when printing. This keeps the function testable without stripping ANSI codes.

4. **Non-destructive note in confirmation line** — add `no files will be changed, folder rename only.` before the confirmation prompt in `cli.ts`, not inside `buildMigratePreview`. This keeps the preview function focused on the tree diagram.

5. **Move contents into subdirectory instead of renaming parent** — the old approach renamed the entire repo directory to a temp location and back. This moved the directory inode, leaving the user's shell in a stale state (pwd showed the old path but files were at the new location). The new approach creates a subdirectory and moves contents into it, keeping the parent inode stable. The user's shell stays at the forest root.

6. **Prominent cd hint** — after migration, print a dimmed comment line followed by `cd <branch>` in bright white (chalk.whiteBright) so the user knows to navigate into their branch folder.

## Risks / Trade-offs

- Tests that assert on file listings will break — straightforward to update since new output is deterministic (no filesystem reads needed in tests)
- Moving contents entry-by-entry is slightly slower than a single rename, but repos rarely have more than ~20 top-level items so this is negligible

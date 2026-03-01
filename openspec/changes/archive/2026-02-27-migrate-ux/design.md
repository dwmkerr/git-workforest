## Context

The `migrate` command moves an entire repo into a subdirectory. Currently it shows a yes/no prompt and a spinner, then a one-line success message. Users don't understand what happened to their filesystem or that they need to `cd` into the new path.

## Goals / Non-Goals

**Goals:**
- Show a before/after preview of the directory restructure before confirmation
- Print a prominent, unindented `cd` command after migration completes
- Keep output concise — don't overwhelm with every file

**Non-Goals:**
- Changing the actual migration logic (rename dance stays the same)
- Adding `--dry-run` or `--verbose` flags
- Auto-changing the user's shell directory (not possible from a child process)

## Decisions

### Preview uses top-level directory listing

Show the immediate children of the repo root in before/after columns. Not a deep tree — just enough to show "your stuff moved into a subdirectory". Use `fs.readdir` on the current directory before migration starts.

Alternative considered: deep recursive tree. Rejected — too noisy, and the point is to show the structural change, not every file.

### `cd` hint printed flush-left with chalk

After migration, print the `cd` path at column 0 (no indentation) using `chalk.cyan` or similar. This is the most important output — the user needs to run this command next. Indenting it would visually subordinate it.

### Preview is built in migrate.ts, printed in cli.ts

The `migrate.ts` module gets a new `buildMigratePreview` function that returns the preview string. The CLI action handles printing and confirmation. Keeps the separation between logic and presentation.

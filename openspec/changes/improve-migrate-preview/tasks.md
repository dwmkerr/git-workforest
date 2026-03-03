## 1. Rewrite preview function

- [x] 1.1 Rewrite `buildMigratePreview` in `src/commands/migrate.ts` to accept `repoName` and `branch` params (no filesystem reads), return plain-text tree diagram
- [x] 1.2 Update caller in `src/cli.ts` to pass `path.basename(gitRoot)` as repo name, apply chalk.dim to `#` comments, and print `no files will be changed, folder rename only.` before confirmation
- [x] 1.3 Update cd hint to show dimmed comment line + bright white `cd <branch>`

## 2. Fix migration strategy

- [x] 2.1 Rewrite `migrateToForest` to create subdirectory and move contents into it (instead of renaming parent directory)

## 3. Update tests

- [x] 3.1 Update `buildMigratePreview` tests in `src/commands/migrate.test.ts` to match new signature and output format
- [x] 3.2 Verify `migrateToForest` tests still pass with new strategy

## 4. Documentation

- [x] 4.1 Update README command docs for `migrate` to reflect new preview and behavior
- [x] 4.2 Add `forest init` idea to ideas.md

## 1. Preview

- [x] 1.1 Add `buildMigratePreview(cwd, branch)` function to `src/commands/migrate.ts` that reads top-level directory entries and returns a before/after string
- [x] 1.2 Add unit tests for `buildMigratePreview` output format

## 2. CLI Integration

- [x] 2.1 Update migrate action in `src/cli.ts` to print preview before confirmation prompt
- [x] 2.2 After successful migration, print `cd <branch>` flush-left with chalk color emphasis
- [x] 2.3 Remove spinner from the preview phase (keep it for the actual migration step)

## 3. Verify

- [x] 3.1 Run full test suite and fix any failures

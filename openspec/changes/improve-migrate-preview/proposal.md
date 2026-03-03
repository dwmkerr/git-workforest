## Why

The current migrate preview is noisy and hard to parse. It lists file contents twice (before and after), making it unclear what the actual structural change is. The user needs to mentally diff two blocks to understand that the only real change is: everything moves into a `<branch>/` subfolder and a `.workforest.yaml` marker is added.

## What Changes

- Replace the verbose before/after file listing with a simple directory-tree diagram showing the structural change
- Remove the duplicated file listing — the user already knows what's in their repo
- Keep the preview concise: show the folder move, not the contents

Example of current output:
```
existing repo detected. migration preview:

  before:
    .env  .git/  .github/  .gitignore  LICENSE  Makefile  ... (15 items)

  after:
    .workforest.yaml
    main/
      .env  .git/  .github/  .gitignore  LICENSE  Makefile  ... (15 items)
```

Proposed output (comments dimmed via chalk, `# before`/`# after` also dimmed):
```
existing repo detected. migration preview:

  # before
  gdog/

  # after
  gdog/
    .workforest.yaml       # preferences
    main/                  # main branch
    <branch-1>/            # worktree
    <branch-2>/            # etc

no destructive changes, one folder rename.
migrate to forest layout? (y/N)
```

The repo name (`gdog/`) and branch name (`main/`) are dynamic. The confirmation line notes that migration is non-destructive — just one folder rename.

## Capabilities

### New Capabilities

### Modified Capabilities
- `migrate-command`: the preview format changes from a before/after file listing to a concise tree diagram

## Impact

- `src/commands/migrate.ts` — `buildMigratePreview` function rewritten
- `src/commands/migrate.test.ts` — snapshot/assertion updates for new preview format

## Context

The CLI has four commands: `clone`, `tree`, `init`, `list`. User feedback says `list` should be `status` (with branch context) and `init` should be `migrate`. Running `workforest` with no args should guide new users rather than dumping commander help.

## Goals / Non-Goals

**Goals:**
- Rename `list` → `status` with active branch highlighting
- Rename `init` → `migrate`
- Show practical usage examples on naked invocation
- Update all tests and README

**Non-Goals:**
- Adding new commands
- Changing clone or tree behaviour

## Decisions

### Rename files, not just command names
Rename `src/commands/list.ts` → `status.ts` and `init.ts` → `migrate.ts` so file names match command names. Keeps codebase navigable.

### Active branch detection in status
Compare `process.cwd()` against each tree's path to determine which tree (if any) the user is in. Mark the active tree with `*` prefix. This avoids extra git calls — just a path prefix check.

### Default output via commander's `action` on the program itself
Use `program.action()` to handle the no-command case. This fires when no subcommand matches and no args are given. Avoids overriding commander's built-in `--help`.

### Migrate keeps interactive flow
`migrate` replaces `init` but keeps the same interactive behaviour: detect context (repo → offer migration, empty → prompt for org/repo to clone).

## Risks / Trade-offs

- **BREAKING**: Users with scripts using `list` or `init` will need to update → acceptable at v0.1.0, pre-release
- Path prefix check for active branch assumes the user is inside the tree directory → works for normal usage, edge case if symlinks are involved

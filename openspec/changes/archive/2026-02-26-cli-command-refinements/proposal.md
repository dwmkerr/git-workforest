## Why

The current CLI commands don't match user mental models. `list` is passive — `status` better communicates "where am I and what's here." `init` is vague — `migrate` is what the command actually does. Running `workforest` with no arguments gives a generic help dump instead of guiding new users.

## What Changes

- **BREAKING**: rename `list` command to `status`
- **BREAKING**: rename `init` command to `migrate`
- `status` shows current branch context when run from inside a branch folder
- naked `workforest` (no command) shows usage examples for clone and migrate instead of default commander help

### New Capabilities

- `status-command`: show trees in the current forest, highlight the active branch when run from a branch folder
- `default-usage`: when run with no arguments, display practical usage examples (clone a repo, migrate an existing one)

### Modified Capabilities

None (no existing specs).

## Impact

- `src/cli.ts` — command wiring, default output
- `src/commands/list.ts` → renamed to `src/commands/status.ts`, add branch detection
- `src/commands/init.ts` → renamed to `src/commands/migrate.ts`
- `src/commands/list.test.ts` → `src/commands/status.test.ts`
- `src/commands/init.test.ts` → `src/commands/migrate.test.ts`
- `README.md` — command documentation

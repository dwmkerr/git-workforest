## Why

There's no single "do the right thing" entry point. Users need to know whether to run `clone`, `migrate`, or `status` depending on context. A `git forest init` command should detect what the user has and guide them.

## What Changes

- Add `git forest init` command that detects context: repo → suggest migrate, forest → show status, empty → offer clone
- Fix blank line between spinner and cd hint after migrate

## Capabilities

### New Capabilities
- `init-command`: the `git forest init` unified entry point

### Modified Capabilities
- `migrate-command`: fix blank line before cd hint after migration completes

## Impact

- `src/cli.ts` — new `init` command, fix migrate cd output spacing
- `src/commands/migrate.ts` — extend `detectContext` to detect forests
- `src/commands/migrate.test.ts` — test for forest detection

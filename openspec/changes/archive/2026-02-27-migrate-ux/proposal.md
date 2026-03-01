## Why

The `migrate` command restructures the filesystem but only shows a spinner and a one-line success message. Users can't tell what happened — what moved where, what was created, or that their shell's working directory is now stale. A filesystem restructure needs a clear before/after preview and an unmissable `cd` hint afterward.

## What Changes

- Show a before/after directory preview before the confirmation prompt
- After migration, print the `cd` path at the top level (not indented) with color emphasis
- Remove the spinner during the preview phase (it adds nothing when the user is reading)

## Capabilities

### New Capabilities

_None — this is a UX refinement of existing behavior._

### Modified Capabilities

- `migrate-command`: Adding requirements for before/after preview output and post-migrate `cd` hint

## Impact

- `src/commands/migrate.ts` — new function to build the preview text
- `src/cli.ts` — updated migrate action to show preview and `cd` hint
- `src/commands/migrate.test.ts` — tests for preview output

## Why

Three related issues with checkout and status:

1. `statusTrees` only scans immediate children of forest root, so nested trees like `feat/masterpiece` (directory `feat/` containing `masterpiece/`) are never found. This causes `checkout` to fail trying to create a branch that already exists.
2. `checkout` uses a spinner for what should be a transparent operation — git output should flow through naturally.
3. `status` throws a red `error:` when not in a forest, but it's just info — should show guidance instead.

## What Changes

- Fix `statusTrees` to recursively scan subdirectories for git repos (handles `feat/branch-name` layout)
- Remove spinner from `checkout`, show git output, use plain messages
- Change "not inside a workforest" from error to info with helpful guidance

## Capabilities

### New Capabilities

### Modified Capabilities
- `status-command`: recursive tree scanning, info message instead of error when not in forest
- `checkout-command`: remove spinner, show git output, find nested trees

## Impact

- `src/commands/status.ts` — recursive directory scanning in `statusTrees`
- `src/commands/status.test.ts` — test for nested tree detection
- `src/commands/checkout.ts` — error message update
- `src/commands/checkout.test.ts` — test updates
- `src/cli.ts` — remove spinner from checkout, change status/checkout error to info

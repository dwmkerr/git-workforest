## 1. Discard stale pending changes

- [ ] 1.1 Delete `openspec/changes/checkout-command/`
- [ ] 1.2 Delete `openspec/changes/checkout-and-status-fixes/`
- [ ] 1.3 Delete `openspec/changes/command-docs-and-screenshots/`
- [ ] 1.4 Delete `openspec/changes/status-sort-and-indicators/`
- [ ] 1.5 Delete `openspec/changes/improve-migrate-preview/`
- [ ] 1.6 Delete `openspec/changes/init-command-and-docs/`
- [ ] 1.7 Run `openspec list --json` and verify only `backfill-current-cli-specs` remains active

## 2. Verify spec deltas describe shipped behaviour

- [ ] 2.1 Cross-check `specs/add-command/spec.md` against `src/commands/checkout.ts` and `src/cli.ts` `add` action — every scenario maps to real code
- [ ] 2.2 Cross-check `specs/list-command/spec.md` against `src/commands/status.ts` and `src/cli.ts` `runStatus` — every scenario maps to real code
- [ ] 2.3 Cross-check `specs/remove-command/spec.md` against `src/commands/remove.ts` and `src/cli.ts` `remove` action — every scenario maps to real code
- [ ] 2.4 Cross-check `specs/init-command/spec.md` against `src/cli.ts` `init` action and `src/commands/migrate.ts` `detectContext` / `buildMigratePreview` — every scenario maps to real code
- [ ] 2.5 Cross-check `specs/default-usage/spec.md` against `git-forest --help` output

## 3. Verify removals match reality

- [ ] 3.1 Confirm `src/cli.ts` has no `checkout` or `tree` command registration — `tree-command` removal is justified
- [ ] 3.2 Confirm `src/cli.ts` has no `status` command registration — `status-command` removal is justified

## 4. Run openspec verify

- [ ] 4.1 Run `openspec verify --change backfill-current-cli-specs` (or `opsx:verify`) and address any reported gaps
- [ ] 4.2 Re-read each new spec one final time for typos and SHALL/MUST consistency

## 5. Archive

- [ ] 5.1 Run `opsx:archive backfill-current-cli-specs`
- [ ] 5.2 Confirm `openspec/specs/tree-command/` and `openspec/specs/status-command/` are gone after archive
- [ ] 5.3 Confirm `openspec/specs/add-command/`, `list-command/`, `remove-command/`, `init-command/` exist after archive
- [ ] 5.4 Confirm `openspec/specs/default-usage/spec.md` reflects current `--help` output
- [ ] 5.5 Confirm `openspec/changes/archive/` contains the dated `backfill-current-cli-specs` entry

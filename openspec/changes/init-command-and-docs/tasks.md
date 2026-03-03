## 1. Fix migrate blank line

- [x] 1.1 Remove the empty `console.log()` after `spinner.succeed` in migrate handler in `src/cli.ts`

## 2. Add forest detection to context

- [x] 2.1 Extend `detectContext` in `src/commands/migrate.ts` to return `"forest"` when `.workforest.yaml` exists in cwd or parent
- [x] 2.2 Add test for `detectContext` returning `"forest"` in `src/commands/migrate.test.ts`

## 3. Add init command

- [x] 3.1 Add `init` command to `src/cli.ts` that calls `detectContext` and routes: forest → status, repo → migrate flow, empty → migrate clone flow
- [x] 3.2 Add init to the help examples in `src/cli.ts`

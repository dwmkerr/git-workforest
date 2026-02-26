## 1. Rename list to status

- [ ] 1.1 Rename `src/commands/list.ts` to `src/commands/status.ts`, update exports
- [ ] 1.2 Add active branch detection: compare cwd against tree paths, mark with `*`
- [ ] 1.3 Rename `src/commands/list.test.ts` to `src/commands/status.test.ts`, add test for active branch marking
- [ ] 1.4 Update `src/cli.ts`: wire `status` command, remove `list`

## 2. Rename init to migrate

- [ ] 2.1 Rename `src/commands/init.ts` to `src/commands/migrate.ts`, update exports
- [ ] 2.2 Rename `src/commands/init.test.ts` to `src/commands/migrate.test.ts`
- [ ] 2.3 Update `src/cli.ts`: wire `migrate` command, remove `init`

## 3. Default usage output

- [ ] 3.1 Add `program.action()` handler showing usage examples for clone and migrate
- [ ] 3.2 Verify `--help` still shows full commander help

## 4. Update documentation

- [ ] 4.1 Update README.md: command names, examples, quickstart

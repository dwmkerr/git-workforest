## 1. Fix recursive tree scanning

- [x] 1.1 Rewrite `statusTrees` in `src/commands/status.ts` to recursively walk subdirectories looking for git repos
- [x] 1.2 Add test for nested tree detection (`feat/branch-name` layout) in `src/commands/status.test.ts`

## 2. Fix checkout

- [x] 2.1 Remove spinner from checkout handler in `src/cli.ts`, use plain messages
- [x] 2.2 Show `already checked out.` when existing tree found, with cd hint
- [x] 2.3 Let git output flow through when creating a new tree (stdio inherit in `gitWorktreeAdd`)

## 3. Fix "not in forest" messages

- [x] 3.1 Change status handler in `src/cli.ts` to show info guidance instead of red error when not in a forest
- [x] 3.2 Change checkout handler similarly

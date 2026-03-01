## 1. Implement checkout command

- [x] 1.1 Create `src/commands/checkout.ts` with `checkoutCommand` function that finds existing tree via `statusTrees` or creates one via `treeCommand` logic
- [x] 1.2 Print cd hint in cyan at column 0 using relative path when inside forest

## 2. Register command and remove tree

- [x] 2.1 Register `checkout <branch>` command in `src/cli.ts`
- [x] 2.2 Remove `tree` command registration from `src/cli.ts`
- [x] 2.3 Delete `src/commands/tree.ts` (keep the functions accessible if checkout reuses them, or inline)

## 3. Tests

- [x] 3.1 Add tests for checkout when tree already exists (prints cd hint, no creation)
- [x] 3.2 Add tests for checkout when tree doesn't exist (creates tree, prints cd hint)
- [x] 3.3 Add test for checkout outside a forest (error + exit 1)
- [x] 3.4 Remove or update tree command tests

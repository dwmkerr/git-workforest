## 1. Wire the alias

- [x] 1.1 In `src/cli.ts`, add a second `.alias("ls")` call to the `list` command registration (alongside the existing `.alias("status")`).
- [x] 1.2 Run the CLI locally and confirm `git forest ls`, `git forest list`, and `git forest status` produce identical output from the same directory.
- [x] 1.3 Run `git forest --help` and confirm both `status` and `ls` appear as aliases of `list`.

## 2. Tests

- [x] 2.1 Add or extend a unit test that asserts the `list` command's registered aliases include both `status` and `ls`.
- [x] 2.2 Verify the existing list/status test suite still passes unchanged (`npm test`).

## 3. Spec sync and verification

- [x] 3.1 Run `openspec validate add-ls-alias-for-list --strict` and resolve any issues.
- [x] 3.2 Run `openspec verify add-ls-alias-for-list` (or `opsx:verify`) and confirm implementation matches the delta spec.
- [x] 3.3 Archive the change with `openspec archive add-ls-alias-for-list` so the new requirement is merged into `openspec/specs/list-command/spec.md`.

## Tasks

### Task 1: Update config schema to support `remote` field
- File: `src/config.ts`
- Add optional `remote` field (string) to `ConfigSchema`
- Add `parseRemoteFromYaml(filePath)` helper that reads a yaml file and returns the `remote` value or `null`

### Task 2: Update `findForestRoot` to require `remote:` and stop at `$HOME`
- File: `src/paths.ts`
- Change return type to `Promise<{ forestRoot: string; remote: string } | null>`
- Read yaml at each candidate, skip files without `remote:` key
- Stop traversal at `os.homedir()` — refuse to treat `$HOME` or `/` as forest root
- If marker at `$HOME` has `remote:`, throw error with clear message
- If legacy marker (no `remote:`) found below `$HOME`, throw error with upgrade instructions

### Task 3: Add `normaliseRemoteUrl` helper and filter trees by remote
- File: `src/git.ts` (helper), `src/commands/status.ts` (filtering)
- Add `normaliseRemoteUrl(url)` that strips `.git` suffix and normalises `git@github.com:org/repo` to `github.com/org/repo` for comparison
- Add `scratch` to `SKIP_DIRS`
- After discovering trees, filter out those whose `origin` URL doesn't match the forest's `remote:` (using normalised comparison)
- `statusTrees` accepts the forest `remote` and passes it through

### Task 4: Update `checkoutCommand` to use marker remote
- File: `src/commands/checkout.ts`
- Accept forest `remote` from `findForestRoot` result
- In fatTrees mode, pass `remote` directly to `gitFatClone` instead of inferring from `trees[0]`
- Update `gitFatClone` signature to accept explicit `remoteUrl` parameter (optional, falls back to reading origin if not provided)

### Task 5: Write `remote:` in `clone` and `migrate`
- Files: `src/commands/clone.ts`, `src/commands/migrate.ts`
- `cloneCommand`: write `remote: <repoUrl>` into `.workforest.yaml` instead of empty string
- `migrateToForest`: read `git remote get-url origin`, write `remote: <url>` into `.workforest.yaml`

### Task 6: Update all callers of `findForestRoot`
- Files: `src/cli.ts`, `src/commands/migrate.ts` (detectContext), `src/commands/remove.ts`
- Adapt to new return type `{ forestRoot, remote } | null`
- Pass `remote` through where needed (e.g. `statusTrees`, `checkoutCommand`)

### Task 7: Update `getRepoName` in CLI to use marker remote
- File: `src/cli.ts`
- `runStatus` and `init` currently call `getRepoName(trees[0].path)` — change to parse org/repo from the marker's `remote` URL directly

### Task 8: Update tests
- Update `status.test.ts`, `checkout.test.ts`, `clone.test.ts`, `migrate.test.ts`
- Ensure test forests have `remote:` in their `.workforest.yaml`
- Add test for `findForestRoot` rejecting files without `remote:`
- Add test for `normaliseRemoteUrl` matching

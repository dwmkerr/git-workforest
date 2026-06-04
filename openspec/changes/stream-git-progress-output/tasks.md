## 1. Stream output from low-level git wrappers

- [ ] 1.1 In `src/git.ts`, extend the options object passed to `gitExec`
  with a `stream?: boolean` field and document it in the `GitOptions` /
  exec-opts interfaces.
- [ ] 1.2 Implement `stream: true` by swapping `child_process.execFile`
  for `child_process.spawn` with `stdio: "inherit"`. Resolve the promise
  on `close` with exit code 0 (return empty stdout/stderr strings) and
  reject on non-zero exit, surfacing the exit code in the error message.
- [ ] 1.3 Keep the existing `execFile` path for the non-streaming case so
  data-extracting calls (`getDefaultBranch`, `getLocalBranch`,
  `isInsideWorktree`, `getRepoName`, `listLocalBranches`, `getRepoRoot`,
  `getRepoName`'s `remote.origin.url` lookup) continue to return parsed
  stdout.
- [ ] 1.4 Default `stream: true` inside `gitClone`, `gitWorktreeAdd`
  (both the existing-branch and `-b` fallback invocations), and
  `gitFatClone` (both the clone and the subsequent `checkout` calls).
  Allow callers to override with `stream: false` for tests.
- [ ] 1.5 Remove the now-dead `verbose` re-print logic from `gitExec`
  (the dim post-hoc stdout/stderr dump) but keep the option accepted so
  callers don't need to change.

## 2. Update CLI handlers for streamed output

- [ ] 2.1 In `src/cli.ts` `clone` action, replace the ora spinner
  (`spinner.start("cloning …")` / `spinner.succeed("cloned to …")`) with
  a plain `console.log("cloning <org>/<repo>…")` before `cloneCommand`
  runs and a plain `console.log("cloned to <path>")` after it returns.
- [ ] 2.2 In `src/cli.ts` `migrate` action's empty-context branch,
  apply the same change — drop the spinner, print
  `cloning <org>/<repo>…` before and `cloned to <path>` after
  `cloneCommand`.
- [ ] 2.3 In `src/cli.ts` `add`/`checkout` action, print
  `adding <branch>…` immediately before calling `checkoutCommand`, but
  only when the result will be a new tree. Since `created` isn't known
  until after the call, restructure so the header prints before the call
  and the existing `already exists`/`already on` branches simply replace
  the would-be `added` summary. (The header is acceptable noise for the
  rare already-exists case; alternatively, gate by first peeking at the
  current trees — pick whichever keeps the handler readable.)
- [ ] 2.4 Leave the `-v / --verbose` flag registered on the root
  command but stop forwarding it to `gitExec`'s now-removed re-print
  path. The flag becomes a no-op.

## 3. Tests

- [ ] 3.1 Update `src/git.test.ts` to cover the new `stream` option:
  assert that `stream: true` uses `spawn` with `stdio: "inherit"` (mock
  `child_process.spawn`), and that `stream: false` / unset still uses
  `execFile`.
- [ ] 3.2 Update `src/git.test.ts` to assert that `gitClone`,
  `gitWorktreeAdd`, and `gitFatClone` default to `stream: true` when the
  caller doesn't override.
- [ ] 3.3 Update `src/cli.test.ts` and `src/commands/clone.test.ts` /
  `src/commands/checkout.test.ts` so they no longer rely on the ora
  spinner being driven, and so they tolerate the new header lines
  (`cloning …`, `adding …`).
- [ ] 3.4 Add an integration-style test asserting that running `git
  forest add` against a stub git binary produces output ordered as:
  header line → child stdout/stderr → `added <branch>.` summary.

## 4. Docs and changelog

- [ ] 4.1 Update `README.md` if it shows pre-streaming output for
  `clone`, `add`, or `migrate` so the examples reflect git's progress
  lines appearing inline.
- [ ] 4.2 Add a CHANGELOG entry under the next release describing the
  output change and noting that `--verbose` is now a no-op.

## 5. Validation

- [ ] 5.1 Run `openspec validate stream-git-progress-output --strict`
  and fix any issues.
- [ ] 5.2 Run `npm test` and ensure all suites pass.
- [ ] 5.3 Manually verify against a real GitHub clone (e.g.
  `git forest clone dwmkerr/effective-shell`) that progress output
  appears live in the terminal during the clone.

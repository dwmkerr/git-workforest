## Why

Slow git operations look like a hang. When `git forest add <branch>` runs in
`fatTrees: true` mode it shells out to `git clone`, which on a large repo can
take a minute or more. Today we capture the child's stdout/stderr and only
print it when `--verbose` is set, so the user sees a silent terminal until
the operation finishes and `added <branch>.` finally appears. `git forest
clone` and `git forest migrate` have the same problem — the ora spinner says
`cloning org/repo…` but git's own progress (`Cloning into…`,
`Receiving objects:  42% …`) is suppressed.

Issue #63 reports exactly this: a user ran `git forest add` against a large
private repo, got no output for the whole clone, and assumed the CLI had
hung. The fix is to follow git's own idiom — when git produces progress
output, let the user see it.

## What Changes

- Stream the child process's stdout/stderr to the parent terminal by default
  for all git invocations (`gitClone`, `gitWorktreeAdd`, `gitFatClone`, and
  any other long-running git subcommands). This surfaces git's native
  progress output (`Cloning into…`, `remote: Counting objects: …`,
  `Receiving objects: …`, etc.) without any reformatting.
- Replace the static ora spinner on `git forest clone` and `git forest
  migrate` (when it falls through to a clone) with a short header line
  followed by the streamed git output. The trailing `cloned to <path>`
  summary still prints when the operation succeeds.
- Add a leading `adding <branch>…` header line to `git forest add` before
  the underlying `git worktree add` / `git clone` runs, so the user always
  sees something on screen before git starts producing its own output.
- Keep `--verbose` as a no-op alias for the new default (it already shows
  git output; the change is that progress is now the default).
- **BREAKING (output only)**: terminals that previously saw only the
  workforest summary lines for `add`, `clone`, and `migrate` now also see
  git's own stdout/stderr. Scripts that parse stderr will see git progress
  lines they did not see before. No flag or exit-code changes.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `git-operations`: low-level git wrappers SHALL stream child stdout/stderr
  to the parent terminal by default rather than buffering and discarding.
- `add-command`: SHALL print a progress header before the underlying git
  operation and SHALL surface git's native progress output for the duration
  of that operation.
- `clone-command`: SHALL surface git's native progress output during the
  clone instead of hiding it behind a static spinner.
- `migrate-command`: when the migrate flow falls through to a clone (empty
  context), it SHALL surface git's native progress output the same way
  `clone-command` does.

## Impact

- Code: `src/git.ts` (gitExec/gitClone/gitWorktreeAdd/gitFatClone stream
  stdio); `src/cli.ts` (replace ora spinner around clone/migrate clones,
  add header for `add`); tests for the same.
- No new dependencies — uses Node's existing `execFile`/`spawn` stdio
  options.
- No changes to exit codes, flags, or the structured summary lines
  (`added <branch>.`, `cloned to <path>`).
- No effect on the `list`, `remove`, or `status` commands — none of them
  run slow git operations.

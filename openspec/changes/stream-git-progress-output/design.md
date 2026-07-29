## Context

`src/git.ts` wraps every git invocation through `gitExec`, which uses
`child_process.execFile` and buffers the child's stdout/stderr. The
callback resolves with strings, and the only way a caller sees them today
is to pass `verbose: true` — which then prints the buffered output *after*
the child exits, dimmed.

The CLI handlers in `src/cli.ts` then wrap clone/migrate calls in an `ora`
spinner with a static message (`cloning org/repo…`). The `add` command has
no spinner at all. So for the three slow paths — `git forest clone`, `git
forest add` in `fatTrees` mode, and `git forest migrate` falling through to
clone — the user gets either a static spinner with no real progress, or
total silence, while `git clone` is the actual long-running operation.

git itself prints rich progress to stderr in interactive mode (`Cloning
into…`, `remote: Counting objects: …`, `Receiving objects: 42% …`). The
fix is to stop hiding that output.

## Goals / Non-Goals

**Goals:**

- The user always sees something on screen while a slow git operation is
  running, by default, with no flag.
- Progress output matches what `git clone` / `git worktree add` would print
  if run directly — same lines, same redraw behaviour, same stream
  (stderr).
- The workforest-level summary lines (`added <branch>.`, `cloned to
  <path>`, `migrated to forest layout.`) are unchanged.
- Non-TTY callers (CI, piped stdout) still get usable output — git's own
  non-TTY behaviour kicks in naturally because we inherit the parent's
  stdio.

**Non-Goals:**

- Reformatting, dimming, or otherwise styling git's output. We pass it
  through verbatim.
- Adding our own progress bar on top of git's. git already has one.
- Changing the behaviour of fast git operations (`rev-parse`,
  `symbolic-ref`, `remote get-url`, `branch --show-current`, etc.). Those
  stay buffered — their output is data we consume programmatically, not
  progress for the user.
- A new `--quiet` flag. Out of scope; can be added later if requested.

## Decisions

### Decision 1: opt-in `stream` flag on `gitExec`, default off for data calls

Add a new option to `gitExec`:

```ts
export interface GitExecOptions {
  cwd?: string;
  verbose?: boolean;
  stream?: boolean; // inherit stdio from parent
}
```

When `stream: true`, swap `execFile` for `child_process.spawn` with `stdio:
"inherit"`. The promise resolves with empty `stdout`/`stderr` strings (the
data went to the terminal, not back to us) and rejects on non-zero exit.

The three slow wrappers — `gitClone`, `gitWorktreeAdd`, `gitFatClone` —
default `stream: true` when their caller doesn't override it. Every other
wrapper (`getDefaultBranch`, `getLocalBranch`, `isInsideWorktree`,
`getRepoName`, `listLocalBranches`, `getRepoRoot`) stays buffered — they
consume the output programmatically.

**Alternatives considered:**

- *Stream stdout/stderr through a transform in `execFile`.* `execFile`
  exposes child streams via the returned `ChildProcess` and you can pipe
  them, but you have to manage the promise lifecycle by hand. `spawn` with
  `stdio: "inherit"` is the same thing with one less moving part.
- *Always stream, never buffer.* Rejected — we need stdout strings from
  the data calls (`symbolic-ref`, `branch --show-current`, etc.) to
  function. Streaming them would break detection.
- *Detect TTY and only stream then.* Rejected — git already handles
  TTY-vs-pipe internally (it shrinks its progress output when stderr is
  not a TTY). Inheriting stdio means git makes the right call for us.

### Decision 2: drop the ora spinner around clone/migrate clones

The ora spinner conflicts with streamed output (spinner redraws its single
line; git's progress output writes multiple lines and uses its own
carriage-return updates). Replace the spinner with a plain header:

```
cloning dwmkerr/effective-shell…
Cloning into '/Users/x/repos/.../main'...
remote: Enumerating objects: 1234, done.
…
cloned to /Users/x/repos/github/dwmkerr/effective-shell/main
```

The header is a plain `console.log` line — no spinner, no colour, just a
sentence so the user sees workforest's intent before git starts talking.

**Alternatives considered:**

- *Keep ora and pause it during the git call.* ora doesn't have a clean
  pause API; we'd have to `.stop()` and re-create. The header-line
  approach is simpler and reads better with git's own output below it.

### Decision 3: `add` prints `adding <branch>…` before the slow call

`add` today prints nothing until completion. Add a single header line
right before `gitWorktreeAdd` / `gitFatClone` runs:

```
adding feat/dark-mode…
```

This guarantees the user sees workforest acknowledge their command even in
the (rare) case where git itself buffers its first line of output. The
trailing `added <branch>.` line is unchanged.

We do *not* gate this header on `fatTrees` mode — `git worktree add` can
also be slow on huge repos. One header line is cheap.

### Decision 4: `--verbose` becomes a no-op alias for the new default

`--verbose` previously toggled the buffered-then-dimmed re-print of git
output. With streaming on by default for slow operations, the flag has
nothing left to do. Keep it registered so existing scripts don't break,
but treat it as a no-op. Document this in the spec.

**Alternatives considered:**

- *Remove `--verbose`.* Rejected — breaks scripts that pass it.
- *Make `--verbose` also stream the fast data calls.* Rejected — those
  calls produce structured data we already display in summary form;
  streaming them would just be noise.

## Risks / Trade-offs

- **Risk**: Tests that asserted "no output during clone" will start
  failing. → Update them. Most tests already mock `gitExec`; they need to
  assert on the streaming path.
- **Risk**: Scripts piping `git forest add` stdout to a file will now see
  git's progress noise on stderr. → Accepted. git itself behaves the same
  way; the user can `2>/dev/null` if they don't want it.
- **Risk**: On Windows / non-ANSI terminals, git's redraw codes may render
  as literal escape sequences. → git itself already handles this by
  checking `isatty()` on its stderr; inheriting stdio gives it the
  correct answer.
- **Trade-off**: We give up the dim-grey styling of git output that the
  old `verbose` path produced. Worth it — matching git's native
  appearance is the goal.

## Migration Plan

Single commit, no flag gate. The change is purely additive from the
user's perspective (more visible output, never less). No data migration,
no config changes. Existing tests need updates — covered in tasks.md.

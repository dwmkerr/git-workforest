# Status: Sort and Worktree Indicators

**Goal:** Make `git forest status` output match `git branch -l` conventions — show `+` prefix for worktree branches, `*` for the active branch, sort alphabetically with default branch first.

**Motivation:** The new screenshot (git-forest-status.png) looks great but the tree list is unsorted and doesn't indicate which entries are worktrees vs the current branch — `git branch -l` uses `+` for worktree branches and `*` for the current branch, and we should match that.

---

## Current behaviour

```
$ git forest status
on branch fix/typo in my-project

trees:
* fix/typo       ./fix/typo
  main           ./main
  docs/readme    ./docs/readme
  feat/dark-mode ./feat/dark-mode
```

- `*` marks the active tree (cwd), all others get blank prefix
- Trees listed in filesystem readdir order (effectively random)
- No distinction between "this is a worktree" and "this is not active"

## Desired behaviour

### Active tree is not the default branch

```
$ git forest status
on branch fix/typo in my-project

trees:
  main            ./main
+ docs/readme     ./docs/readme
+ feat/dark-mode  ./feat/dark-mode
* fix/typo        ./fix/typo
```

### Active tree is the default branch

```
$ git forest status
on branch main in my-project

trees:
* main            ./main
+ docs/readme     ./docs/readme
+ feat/dark-mode  ./feat/dark-mode
+ fix/typo        ./fix/typo
```

### No active tree (run from forest root)

```
$ git forest status
in my-project

trees:
  main            ./main
+ docs/readme     ./docs/readme
+ feat/dark-mode  ./feat/dark-mode
+ fix/typo        ./fix/typo
```

### Prefix rules (matching `git branch -l`)

| Prefix | Meaning | Colour |
|--------|---------|--------|
| `*` | Active tree (cwd is inside this worktree) | green (existing) |
| `+` | Worktree branch (not active) | unchanged (default) |
| ` ` | Default branch when not active (no `+` — it's the primary copy, not a linked worktree) | — |

The default branch gets a blank prefix when not active because it's the primary clone, not a linked worktree. Every other non-active tree gets `+` because they are worktrees linked from the primary clone. This matches `git branch -l` where the main checkout has no marker and linked worktree branches show `+`.

### Sort order

1. **Default branch first** — detected via `git symbolic-ref refs/remotes/origin/HEAD`, falling back to checking for `main` then `master`
2. **Alphabetical** by branch name for the rest

### Detecting the default branch

Use `git symbolic-ref refs/remotes/origin/HEAD` from any tree's working directory. This returns e.g. `refs/remotes/origin/main`. Parse the branch name from the last path segment. If the command fails (no remote, no HEAD ref set), fall back to checking if any tree has branch `main`, then `master`. If none match, skip the "pin to top" behaviour and just sort alphabetically.

---

## Changes

### 1. `src/commands/status.ts`

**Add `getDefaultBranch(gitDir: string): Promise<string | null>`** — runs `git symbolic-ref refs/remotes/origin/HEAD`, parses the branch name, falls back to `null`.

**Sort trees in `statusTrees`:** After `findTrees` returns, detect the default branch, then sort:
- Default branch first
- Remaining entries sorted alphabetically by `tree.branch`

**Add `isDefaultBranch` to `TreeEntry`** (or pass default branch name alongside) so the renderer knows which entry is the default branch vs just inactive.

**Update `formatTreeLine`:** Three-way prefix:
- Active: `"* "`
- Default branch (not active): `"  "`
- Other (not active): `"+ "`

### 2. `src/cli.ts`

**Update prefix in render loop:** The inline prefix logic should become three-way to match `formatTreeLine`:
- `tree.active ? "* " : tree.isDefault ? "  " : "+ "`

### 3. `src/commands/status.test.ts`

**Update `formatTreeLine` tests:**
- Inactive non-default tree: expect `"+ fix-typo  ./fix-typo"`
- Inactive default tree: expect `"  main  ./sharpgl"` (blank prefix, no `+`)

**Add sort order test:**
- Create a forest with `main`, `feat/a`, `docs/b` trees
- Assert `statusTrees` returns them in order: `main`, `docs/b`, `feat/a`

**Add default branch detection test:**
- Verify `getDefaultBranch` returns `main` for a repo with `origin/HEAD -> origin/main`

### 4. Screenshots (follow-up)

After implementation, retake `docs/screenshots/status.png` and `docs/screenshots/hero.png` to reflect the new output format.

---

## Out of scope

- Colour changes (keep existing green for active, default for inactive)
- Any changes to the `clone`, `checkout`, or `migrate` commands

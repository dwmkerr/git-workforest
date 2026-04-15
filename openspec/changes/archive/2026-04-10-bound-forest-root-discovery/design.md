## Context

`findForestRoot` currently looks for any file named `.workforest.yaml` walking up from cwd. The same filename is reused as the global config file at `~/.workforest.yaml`. When no closer marker exists, traversal reaches `$HOME`, matches the global config, and `findTrees` then recursively scans the entire home directory spawning a `git branch --show-current` subprocess per entry. Observed real-world impact: `git forest list` takes tens of seconds in an unrelated repo.

The root cause is conflation: one filename is being asked to serve two unrelated roles (global config vs forest marker). Research into other tools (git, cargo, find-up) confirmed there is no single convention — git uses filesystem-device boundaries, cargo stops at `CARGO_HOME`, find-up walks to `/` by default. We want a simpler, content-based distinction plus a `$HOME` guardrail.

We also want the forest marker to be more than a sentinel: it should carry the minimum information required to rebuild the forest from an empty directory, which is the git remote URL.

## Goals / Non-Goals

**Goals:**
- Fix the home-directory scan bug so `git forest list` is fast regardless of where it is run.
- Make the forest marker self-describing enough to recreate the forest via a future `git forest clone`-from-marker flow.
- Keep a single config filename (`.workforest.yaml`) — no new file types.
- Give users a clear, actionable error when they hit the legacy case.

**Non-Goals:**
- Implementing the recreation command itself (separate change).
- Changing the global config schema beyond adding the optional `remote` key.
- Supporting multiple remotes per forest.
- Changing how individual worktrees are discovered inside a forest (still `findTrees`).

## Decisions

### Decision 1: distinguish forest marker from config by content, not filename

A `.workforest.yaml` file is a forest marker **if and only if** it contains a top-level `remote:` key with a non-empty string value. Otherwise it is global or local config and is ignored by `findForestRoot`.

**Alternatives considered:**
- Separate filename (e.g. `.workforest` sentinel or `forest.yaml`). Rejected: adds a second file type, complicates docs and discovery.
- Explicit `forest: true` boolean. Rejected: carries no useful information; `remote:` doubles as the recreation recipe.
- Directory-based marker (`.workforest/`). Rejected: heavier than a single file, no benefit.

**Rationale:** one filename, unambiguous schema, and the marker key is load-bearing — it documents the forest's identity and enables future recreation.

### Decision 2: `remote:` is the minimum viable forest state

The only field required to reconstruct a forest from an empty container directory is the git remote URL. Everything else is derivable:
- `org`/`repo`/`provider` → parsed from the URL (existing `getRepoName` logic).
- default branch → `git symbolic-ref refs/remotes/origin/HEAD` after clone.
- tree layout → global `treeDir` pattern.
- individual trees → user re-adds via `git forest add` or a future `git forest restore`.

### Decision 3: halt traversal at `$HOME`

`findForestRoot` stops walking once `dir === os.homedir()`. If a `.workforest.yaml` containing `remote:` is found **at** `$HOME` or `/`, it is refused with a clear error rather than accepted — those locations are never valid forest roots.

**Alternatives considered:**
- git-style `st_dev` filesystem-boundary check. Good but doesn't address the actual bug (the home config file). We can layer this in later if needed.
- `GIT_CEILING_DIRECTORIES`-style env var. Overkill for the real problem.

### Decision 4: migration is manual, with a helpful error

When discovery finds a `.workforest.yaml` without `remote:` in a plausible forest location (i.e. not `$HOME`), it treats the file as legacy and errors with the exact line to add:

```
error: forest marker at <path> is missing the 'remote:' key.

# add the remote url to the forest marker:
echo 'remote: <git-url>' >> <path>
```

Auto-migration is rejected because the tool cannot reliably infer the remote URL without inspecting a child worktree, and silent file rewrites are surprising.

### Decision 5: `init`, `clone`, `migrate` write `remote:`

These commands already know the remote URL at creation time, so they SHALL write a forest-level `.workforest.yaml` containing at minimum:

```yaml
remote: git@github.com:<org>/<repo>.git
```

`migrate` reads `git remote get-url origin` from the existing repo it is adopting.

### Decision 6: `findForestRoot` returns the remote URL alongside the path

`findForestRoot` returns `{ forestRoot: string, remote: string }` instead of just `string | null`. This makes the marker's remote available to all callers without re-reading the file.

### Decision 7: commands use the marker's remote, not a child tree's origin

`checkoutCommand` (backing `git forest add`) reads origin from the marker's `remote:` value. In fatTrees mode, `gitFatClone` receives this URL directly instead of inferring it from `trees[0]`. This prevents wrong-repo clones when unrelated repos (e.g. `scratch/ark`) exist in the forest directory.

### Decision 8: `findTrees` filters by remote and skips `scratch/`

`scratch/` is added to `SKIP_DIRS` alongside `node_modules`, `.git`, `.worktrees`. Additionally, `findTrees` compares each discovered tree's `origin` URL against the marker's `remote:` and excludes non-matching trees from the listing. URL comparison normalises trailing `.git` and protocol differences (ssh vs https) to avoid false negatives.

## Risks / Trade-offs

- **Breaking change for existing forests.** → Clear error message with exact fix command; documented in CHANGELOG.
- **Users with `remote:` accidentally in `~/.workforest.yaml`.** → The `$HOME` guard refuses it and prints a specific error ("refusing to treat $HOME as a forest root; remove the 'remote:' key from ~/.workforest.yaml").
- **Repos with multiple remotes.** → We persist the `origin` URL only. Non-goal for this change; can extend later.
- **URL drift** (user changes remote after forest creation). → `.workforest.yaml` becomes stale. Accepted; future `git forest doctor` could reconcile.

## Migration Plan

1. Ship the new discovery behaviour alongside `init`/`clone`/`migrate` writing `remote:`.
2. On first run in a legacy forest, users see the explicit error and add the key (one line).
3. Document in CHANGELOG and README under a "Breaking changes" heading.
4. No rollback needed: the legacy file format is a strict subset (empty or config-only `.workforest.yaml`), so reverting the code makes old forests work again.

## Resolved Questions

- **Derive only.** Only `remote:` is persisted. `provider`/`org`/`repo` are parsed on demand via the existing `getRepoName` logic. Keeps the file minimal and avoids drift.
- **No `st_dev` check.** Not needed — the `$HOME` guard addresses the real bug. Revisit only if a concrete mount-point case appears.

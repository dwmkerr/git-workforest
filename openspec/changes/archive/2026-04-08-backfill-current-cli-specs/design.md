## Context

`openspec/specs/` describes a CLI that no longer exists. Between `2026-02-26-cli-command-refinements` (the last archived change) and PR #39 (`align commands with git worktree semantics`), the project went through six unarchived change proposals and a non-spec'd rename. The shipped CLI on `main` today exposes `clone`, `add`, `list`, `remove`, `migrate`, `init` — none of `tree`, `checkout`, `status` exist any more.

This design is for a paperwork-only change that brings the specs back in line with reality, without modifying any source code.

## Goals / Non-Goals

**Goals:**
- `openspec/specs/` describes the CLI as shipped on `main` after this change is archived.
- `openspec/changes/` contains only this one in-flight change after the discards land.
- Future drift is prevented by the pre-push specguard hook (already in place at `.git/hooks/pre-push`).
- Rationale that's still relevant from the discarded changes (e.g. nested-tree handling, migrate preview design, init context detection) is preserved by being lifted into the new specs.

**Non-Goals:**
- No code changes. No test changes. No README changes.
- Not adding `delete`/`rm` aliases for `remove` — `remove` mirrors `git worktree remove` and that's the convention.
- Not adding the `completion` subcommand (tracked separately in dwmkerr/git-workforest#45).
- Not redesigning the spec layout for non-command capabilities (`config`, `forest-detection`, `git-operations`, etc.) — these are unchanged and out of scope.

## Decisions

### Strategy: discard-and-rewrite over chronological archive

**Decision:** Delete the six pending changes outright. Do not attempt to archive them in chronological order.

**Why:** Four of the six are superseded or abandoned. The two that contain real rationale (`improve-migrate-preview`, `init-command-and-docs`) target specs that either still exist (`migrate-command`) or need to be created fresh (`init-command`) — lifting their rationale into the new specs preserves what matters without the ceremony of a multi-step archive that briefly creates command specs only to immediately delete them.

**Alternatives considered:**
- *Archive everything in timestamp order, then a separate rename change.* Honest history but creates `tree-command`, `checkout-command`, `status-command` specs that we'd immediately delete in the next step. High ceremony, low value — git history already preserves the file history.
- *Surgical: archive the two clean changes, discard the four stale ones, then a rename change.* Cleaner but still requires ordering and produces three changes where one would do. The user explicitly asked for "clean and simple" so this was rejected.

### Spec naming: command-name-command

**Decision:** Use `add-command`, `list-command`, `remove-command`, `init-command` as capability folder names.

**Why:** Matches the existing convention (`clone-command`, `migrate-command`). Command-level specs are a stable unit because each command is a contract with users.

### Discarded-change rationale: lifted, not preserved separately

**Decision:** Discarded changes are deleted from the working tree. Anything worth keeping gets restated as a requirement or scenario in a new spec.

**Why:** Half-archived changes are spec rot. Git history (the `git log` of `openspec/changes/`) is the audit trail.

**Specifically lifted:**
- From `improve-migrate-preview`: the preview output format. (Not modifying `migrate-command` spec in this change — already covers it. If gaps surface during verification, lift then.)
- From `init-command-and-docs`: context detection (forest / repo / empty), the migration prompt flow. → `init-command/spec.md`.
- From `checkout-and-status-fixes`: nested-tree discovery (e.g. `feat/foo` as `feat/`+`foo/`). → `add-command` and `list-command` specs.
- From `status-sort-and-indicators`: default-branch-first sort, `*`/`+` prefix conventions. → `list-command/spec.md`.
- From `command-docs-and-screenshots`: nothing — it was a draft with 0 tasks targeting a non-existent capability.
- From `checkout-command`: nothing — fully superseded.

## Risks / Trade-offs

- **Risk:** The new specs might miss edge cases that were captured only in the discarded changes' delta files. → Mitigation: the verify step (`opsx:verify`) runs against the actual code, which is the source of truth — if a behaviour is in the code but not the new spec, verify will flag it.
- **Risk:** The pre-push specguard hook may flag this PR itself as "behavioural change without specs" because it touches `openspec/changes/` directory. → Mitigation: this PR is explicitly a spec-only change; bypass with `--no-verify` is allowed by CLAUDE.md for "docs/chore commits".
- **Trade-off:** Discarding the unarchived changes loses the original proposal/design narrative for `improve-migrate-preview` and `init-command-and-docs`. → Accepted: git history retains the files.

## Migration Plan

This is a paperwork change with no runtime impact. After merge:
1. `openspec/specs/` accurately reflects shipped behaviour.
2. The pre-push hook becomes meaningful — any future push that adds CLI behaviour without a corresponding spec change will be blocked.
3. Contributors can read `openspec/specs/<command>/spec.md` to understand current contracts before making changes.

No rollback is needed beyond `git revert`.

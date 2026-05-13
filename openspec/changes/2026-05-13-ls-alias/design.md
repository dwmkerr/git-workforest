## Context

The `list` command already has full implementation in `src/commands/status.ts` and a `status` alias registered via `.alias("status")`. Commander.js supports multiple aliases via `.aliases([...])` — we switch from the single-alias form to the multi-alias form to add `ls`.

## Goals / Non-Goals

**Goals:**
- `git forest ls` works identically to `git forest list` and `git forest status`

**Non-Goals:**
- No new behaviour beyond the alias
- No changes to `status.ts` implementation

## Decisions

- **Use Commander `.aliases(["status", "ls"])`**: replaces the existing `.alias("status")` registration. Commander's single-alias setter overwrites prior aliases, so the multi-form is required to keep both.

## Risks / Trade-offs

_(none — this is a one-line alias registration change using an established pattern)_

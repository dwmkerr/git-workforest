## Context

The `add` command already has full implementation in `src/commands/checkout.ts`. Commander.js supports `.alias()` natively — the project already uses this pattern for `list`/`status` and `remove`/`delete`.

## Goals / Non-Goals

**Goals:**
- `git forest checkout <branch>` works identically to `git forest add <branch>`

**Non-Goals:**
- No new behaviour beyond the alias
- No changes to `checkout.ts` implementation

## Decisions

- **Use Commander `.alias("checkout")`**: matches existing `list`/`status` and `remove`/`delete` pattern. Zero new code beyond the registration.

## Risks / Trade-offs

_(none — this is a one-line alias registration using an established pattern)_

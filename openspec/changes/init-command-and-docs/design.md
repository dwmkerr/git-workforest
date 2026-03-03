## Context

The CLI has `clone`, `migrate`, `checkout`, and `status` commands. Users need to know which to run. A `git forest init` command detects context and routes to the right action. Also, migrate has a blank line before the cd hint (ora spinner adds a newline).

## Goals / Non-Goals

**Goals:**
- Add `init` command that routes based on context detection
- Fix blank line between spinner.succeed and cd hint in migrate

**Non-Goals:**
- Changing migrate, clone, or status behavior
- Adding new flags or options to init
- Documentation updates (separate change)

## Decisions

1. **`init` reuses existing `detectContext`** — the migrate module already has context detection (repo vs empty). We extend it to also detect "forest" (checks for `.workforest.yaml`). The init command calls the appropriate existing command or prints guidance.

2. **`init` inside a forest runs `status`** — if already in a forest, just show the current state. No need for a new flow.

3. **`init` inside a repo suggests `migrate`** — print the migrate preview and prompt, same as `migrate` does when inside a repo. Reuse the migrate code path directly.

4. **`init` outside a repo suggests `clone`** — prompt for org/repo, same as `migrate` does when outside a repo. Reuse the migrate code path directly.

5. **`init` is effectively an alias for smart-migrate + status** — since `migrate` already handles repo-or-empty, and we just add forest detection, `init` is a thin wrapper that checks for forest first, then delegates to migrate logic.

6. **Fix blank line by removing `console.log()` after spinner** — the empty `console.log()` between spinner.succeed and the cd hint adds an unwanted blank line. Remove it.

## Risks / Trade-offs

- `init` overlaps with `migrate` — acceptable since init is the "I don't know what to run" entry point, while migrate is explicit

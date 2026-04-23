## Context

Two small UX bugs:

1. `confirm()` in `src/cli.ts` returns `true` for any input that isn't lowercase `"n"`. The helper takes no default — it treats empty input (just enter) as yes. The displayed prompts use the conventional `Y/n` (default yes) and `y/N` (default no) form, but the function ignores which default the prompt advertises.

2. `migrate` in `src/cli.ts` branches on `context === "repo"` only. The else branch unconditionally prompts to clone, even when the user is already inside a forest.

`init` already handles all three contexts correctly (forest/repo/empty) — `migrate` just needs to learn the same pattern.

## Goals / Non-Goals

**Goals:**
- Confirmation respects the displayed default.
- `migrate` from inside a forest prints the tree listing, not a clone prompt.
- No change to non-interactive flows (`-y` flags, scripted use).

**Non-Goals:**
- Changing the prompt text or colours.
- Auto-cd after migrate (shells don't allow it).
- Refactoring the three command handlers (`init`, `migrate`, `list`) into a shared context-dispatch — too much churn for two-line bug fixes.

## Decisions

### Decision 1: `confirm()` takes an explicit default

```ts
async function confirm(question: string, defaultYes: boolean): Promise<boolean>
```

Empty input returns `defaultYes`. Otherwise `y`/`yes` → true, `n`/`no` → false (case-insensitive). Anything else returns `defaultYes` (lenient — better than throwing on a typo).

**Alternatives considered:**
- Parse the prompt string for `Y/n` vs `y/N`. Rejected: implicit and brittle.
- Return-type `"yes" | "no" | "default"` and let caller decide. Rejected: every caller would duplicate the same default-handling.

### Decision 2: `migrate` handles forest context inline

Add an `if (context === "forest")` branch in `migrate` that mirrors what `init` does for the same case (print "already a forest. on branch X in org/repo" and the tree list). Don't extract a shared helper yet — `init` and `migrate` have slightly different output surrounding the listing, and refactoring is out of scope.

## Risks / Trade-offs

- **Risk**: callers that pass a typo (e.g. `"yse"`) now silently get the default rather than treated as yes. → Acceptable; the only callers are interactive prompts where the user can re-run.
- **Risk**: duplicated forest-context output between `init`, `migrate`, and `list`. → Accepted as future cleanup; flagged in non-goals.

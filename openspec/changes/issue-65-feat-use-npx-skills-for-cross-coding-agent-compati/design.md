## Context

See `proposal.md` for motivation.

The workforest plugin lives at `plugins/git-workforest/skills/workforest/SKILL.md`. Currently it is installed only via `claude plugin add dwmkerr/git-workforest`, which is a Claude Code-specific mechanism. The npm package's `bin` map already exposes `git-workforest`, `workforest`, and `git-forest` — all pointing to `bin/git-workforest.js`. A `skill` sub-command on the existing CLI is the natural extension point.

The `files` field in `package.json` currently includes `dist`, `bin`, `man`, and `scripts`. The `plugins/` directory is excluded, so the skill file is not present in the published package. That must change.

## Goals / Non-Goals

**Goals:**
- `npx @dwmkerr/git-workforest skill` writes the skill to `.claude/skills/workforest/SKILL.md` (default).
- `npx @dwmkerr/git-workforest skill --agent generic` writes to `.agent/skills/workforest.md`.
- The README skills section moves above Commands and leads with the `npx` command.
- No new runtime npm dependencies.

**Non-Goals:**
- Auto-detecting which coding agent is installed (filesystem heuristics are unreliable and create maintenance burden; explicit `--agent` is simpler).
- Supporting every possible agent at launch; the `--agent` flag is the extension point for future agents.
- Modifying the skill content itself (that is a separate concern).

## Decisions

### Decision 1: `skill` as a sub-command on the existing CLI, not a separate binary

**Chosen**: Add a `skill` command to `src/cli.ts` (and surface it via the existing `bin/git-workforest.js` entry point) so `npx @dwmkerr/git-workforest skill` works. No new `bin` entry is needed.

**Alternatives considered**:
- Separate `bin` entry (`git-workforest-skill`): would be invoked as `npx @dwmkerr/git-workforest-skill`, which is clunky and less discoverable.
- A standalone package (`@dwmkerr/workforest-skill`): requires a separate publish pipeline. Overkill for a single file copy.

### Decision 2: Skill content shipped as a file inside `plugins/`

**Chosen**: Add `plugins/` to the `files` array in `package.json`. The installer reads the bundled file at runtime using `import.meta.url`/`fileURLToPath` to locate the package root.

**Alternatives considered**:
- Embed the skill content as a string literal in source: duplicates the canonical `SKILL.md` and means two places to update.
- Fetch from GitHub at install time: requires network; fails offline; violates the offline-first story of a global CLI tool.

### Decision 3: Default target is Claude Code (`.claude/skills/`)

**Chosen**: When `--agent` is omitted, write to `.claude/skills/workforest/SKILL.md`. This is the most common case and matches the existing `claude plugin add` behaviour.

**Alternatives considered**:
- Require explicit `--agent` every time: more friction; most current users are on Claude Code.
- Detect agent from environment: fragile — multiple agents can coexist, and environment variables differ across OS and shell.

## Risks / Trade-offs

- **Risk**: `.claude/skills/` path is coupled to Claude Code's current conventions, which may change. → Claude Code is the dominant target; the spec captures the path so any future change is a spec update, not a hidden assumption.
- **Risk**: Users with existing `claude plugin add` installs may end up with duplicate skill content. → Acceptable for now; the two install mechanisms are independent. Documented in the README as equivalent alternatives.
- **Risk**: `plugins/` being added to published `files` slightly increases package size. → Negligible — it is a single Markdown file.

## Open Questions

_None._

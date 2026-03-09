## Context

Each CLI command (`clone`, `migrate`, `init`, `status`, `checkout`) needs a docs section in the README with a short description and terminal output examples. Some commands already have partial docs; others have screenshots but no code examples, or code examples but no screenshots.

The README currently mixes styles — some commands show `bash` blocks, others use `<img>` tags, and the level of detail varies. We want a consistent format across all commands.

## Goals / Non-Goals

**Goals:**
- Consistent docs section for every command: 2-3 sentence description + 2-3 scenario code snippets showing real output
- Terminal screenshots captured via shellwright for visual reference
- CLAUDE.md instructions so screenshots can be recaptured as commands evolve

**Non-Goals:**
- Video/GIF recordings (future work)
- Auto-generating docs from code
- Man pages or `--help` improvements

## Decisions

1. **Each command section follows the same format**: short description (2-3 sentences), then 2-3 fenced `bash` blocks showing realistic `$ git forest <cmd>` invocations with their output. Screenshots sit below the code examples.

2. **Screenshots go in `docs/screenshots/<command>.png`** — one per command, captured with shellwright using a consistent terminal size and prompt (`$ `). SVGs are not used because shellwright outputs PNG.

3. **CLAUDE.md gets a "Screenshots" section** describing how to recapture: shellwright MCP setup, terminal dimensions, PS1 prompt, and the workflow for each command.

## Risks / Trade-offs

- Screenshots go stale when output format changes → mitigated by documenting the recapture process in CLAUDE.md
- Code snippet examples in README could drift from actual output → keep snippets minimal (show structure, not exact spacing)

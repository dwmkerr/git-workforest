## Why

The workforest coding-agent skill is currently only installable via `claude plugin add dwmkerr/git-workforest`, which ties it to Claude Code's proprietary plugin mechanism. Users who rely on GitHub Copilot (Codex), Cursor, or any other coding agent that reads project context files cannot benefit from the skill. Distributing the skill as an `npx`-runnable installer makes workforest agent-agnostic and matches the npm-native distribution story the package already uses.

## What Changes

- Add an `npx`-accessible skill installer: running `npx @dwmkerr/git-workforest skill` (or a standalone `npx @dwmkerr/workforest-skill`) writes the `SKILL.md` content into the appropriate location for the detected coding agent (Claude Code → `.claude/skills/workforest/SKILL.md`, generic fallback → `.agent/skills/workforest.md`).
- Move the coding-agent / skills section in `README.md` to immediately after the Quickstart section so it appears before Commands and Configuration — making it the first thing a new user sees after install instructions.
- Update the README snippet to show the `npx` install method as the primary path, with the `claude plugin add` command retained as an equivalent alternative for Claude Code users.

## Capabilities

### New Capabilities

- `coding-agent-skills`: How the workforest skill is packaged, distributed, and installed into a project for use by coding agents (Claude Code, GitHub Copilot/Codex, Cursor, etc.). Covers the `npx`-based install flow, the supported target locations, and the README surface area.

### Modified Capabilities

_None._

## Impact

- Code: new `scripts/install-skill.mjs` (or inline in `bin/`) that writes `SKILL.md` to the resolved target path; new `bin` entry (e.g. `git-workforest-skill`) so `npx @dwmkerr/git-workforest skill` routes to it; updated `package.json` `files` field to include the skill content.
- Docs: `README.md` section reorder and updated install snippet.
- No changes to CLI commands, git operations, or existing tests.
- No new runtime dependencies.

## 1. Package: include skill content in published files

- [ ] 1.1 Add `plugins/` to the `files` array in `package.json` so the skill Markdown file is present in the installed package

## 2. CLI: add `skill` sub-command

- [ ] 2.1 Add a `skill` command to `src/cli.ts` with an optional `--agent <name>` flag (accepted values: `claude` (default), `generic`)
- [ ] 2.2 In the `skill` command handler, resolve the bundled skill file path using `import.meta.url` + `fileURLToPath` pointing at `plugins/git-workforest/skills/workforest/SKILL.md`
- [ ] 2.3 Determine the output path based on `--agent`:
  - `claude` (default): `.claude/skills/workforest/SKILL.md` relative to `process.cwd()`
  - `generic`: `.agent/skills/workforest.md` relative to `process.cwd()`
- [ ] 2.4 Create the target directory (recursively) and write the skill file
- [ ] 2.5 Print confirmation: `skill written to <relative-path>` (no spinner — fast operation)

## 3. Tests

- [ ] 3.1 Add unit tests for the `skill` command covering: default agent (claude path), `--agent claude`, `--agent generic`, and an unknown `--agent` value (should error)

## 4. Docs: README update

- [ ] 4.1 Move the "Claude Code and coding agent setup" section to immediately after the Quickstart section (before Commands)
- [ ] 4.2 Update the section content to show `npx @dwmkerr/git-workforest skill` as the primary install method, with `claude plugin add dwmkerr/git-workforest` listed as an alternative for Claude Code users
- [ ] 4.3 Briefly mention `--agent generic` for users on other coding agents

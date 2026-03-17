# workforest

## Project tracking

- **Ideas and future work**: `ideas.md` (project root)

## Git conventions

workforest mirrors git's UX wherever possible — commands, flags, and output should feel familiar to git users:

- **Commands map to git equivalents**: `git forest status` mirrors `git status`/`git branch -l`, `git forest checkout` mirrors `git checkout`
- **Flags follow git conventions**: prefer short flags (`-b` over `--branch`, etc.)
- **Output matches git formatting**: `*` for active branch, `+` for worktree branches (matching `git branch -l`), `already on <branch>.` (matching `git checkout`)
- When adding new commands or flags, check if git has an equivalent and match it

## CLI output style

- All output is **lowercase** (e.g. `cloning...`, `cloned to`, `aborted.`)
- Errors use `error:` in red (via chalk) — no emoji prefixes
- Use ora spinners only for long operations (clone). Fast operations (migrate, checkout) use plain messages
- Confirmation prompts are inline questions (e.g. `clone org/repo to /path? (Y/n)`)
- Mirror git's output style where possible to reduce cognitive dissonance (e.g. `already on <branch>.` like `git checkout`)

## Terminal colour conventions

Colours match `git branch -l` where possible:

- **Active branch** (`*`): green (`chalk.green`) — matches git's current branch colour
- **Worktree branch** (`+`): cyan (`chalk.cyan`) — matches git's linked worktree colour
- **Default branch** (no prefix): no colour — matches git's regular branch colour
- **Directories/paths** (always `./` prefixed): bright white (`chalk.whiteBright`)
- **Repo names** (`org/repo`): bright white (`chalk.whiteBright`)
- **Shell commands**: bright white (`chalk.whiteBright`)
- **Comments / annotations**: dim grey (`chalk.dim`)
- **Errors**: red (`chalk.red`)

## cd hint pattern

After any command that changes the user's working location, print:

```
# please change directory:
cd <path>
```

The comment line is dimmed (`chalk.dim`), the `cd` command is bright white (`chalk.whiteBright`). No blank line between the spinner output and the hint.

## Terminal screenshots

Use the shellwright MCP server to capture terminal screenshots for docs:

1. Start a shell session with `mcp__shellwright__shell_start` (use `nab` theme for dark warm tones)
2. `cd` to the target forest and run the command
3. Take a screenshot with `mcp__shellwright__shell_screenshot` using `border: { style: "macos", title: "Terminal" }`
4. `curl -o docs/screenshots/<name>.png <download_url>` to save the file
5. Stop the session with `mcp__shellwright__shell_stop`

For SVG output, save as `.svg` instead. Screenshots go in `docs/screenshots/`.

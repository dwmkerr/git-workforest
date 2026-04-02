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

Use the shellwright MCP server to capture screenshots for `docs/screenshots/`:

1. `shell_start` — command: `bash`, args: `["--login", "-i"]`, theme: `one-dark`, cols: `80`, rows: `22` (adjust to fit content without wrapping)
2. Set a clean bright white prompt: `PS1=$(printf '\033[97m$ \033[0m')` then `cd` to the target forest, then `clear`
3. Run the command
4. `shell_screenshot` — border: `{ style: "macos", title: "Terminal" }`
5. `curl -o docs/screenshots/<name>.png <download_url>`
6. `shell_stop`

The prompt MUST be a bright white `$ ` (ANSI 97) — no username, path, git branch, or conda env. Always set `PS1` before taking screenshots. Use bash (not zsh). Verify no line wrapping before taking the screenshot.

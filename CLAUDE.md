# workforest

## Project tracking

- **Ideas and future work**: `ideas.md` (project root)

## CLI output style

- All output is **lowercase** (e.g. `cloning...`, `cloned to`, `aborted.`)
- Errors use `error:` in red (via chalk) — no emoji prefixes
- Use ora spinners for progress, `spinner.succeed()` for completion
- Confirmation prompts are inline questions (e.g. `clone org/repo to /path? (Y/n)`)

## Terminal colour conventions

- **Branch names**: green (`chalk.green`)
- **Folder/path names**: blue (`chalk.blue`)
- **Shell commands**: bright white (`chalk.whiteBright`)
- **Comments / annotations**: dim grey (`chalk.dim`)

## cd hint pattern

After any command that changes the user's working location, print:

```
# please change directory:
cd <path>
```

The comment line is dimmed (`chalk.dim`), the `cd` command is bright white (`chalk.whiteBright`). No blank line between the spinner output and the hint.

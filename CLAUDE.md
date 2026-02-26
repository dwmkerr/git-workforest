# workforest

## CLI output style

- All output is **lowercase** (e.g. `cloning...`, `cloned to`, `aborted.`)
- Errors use `error:` in red (via chalk) — no emoji prefixes
- Use ora spinners for progress, `spinner.succeed()` for completion
- Confirmation prompts are inline questions (e.g. `clone org/repo to /path? (Y/n)`)

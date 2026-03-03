## Why

Each command should have a terminal screenshot in the README so users can see what it looks like before running it. We use shellwright MCP for recording, and need a documented process so screenshots stay up to date as commands evolve. Later these may become recordings/videos.

## What Changes

- Add shellwright recording instructions to CLAUDE.md (PS1 set to bright white `$ `, shellwright MCP, screenshot workflow)
- Capture terminal screenshots for each command (`migrate`, `clone`, `status`, `init`, `checkout`)
- Update README command sections to include screenshots
- Establish `docs/screenshots/` as the location for terminal screenshots

## Capabilities

### New Capabilities
- `command-docs`: how we capture, store, and maintain terminal screenshots for commands

### Modified Capabilities

## Impact

- `CLAUDE.md` — shellwright recording instructions
- `README.md` — screenshots embedded in command sections
- `docs/screenshots/` — new directory for terminal screenshot PNGs

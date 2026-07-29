## Why

Workforest is installed as a Unix command-line tool, but its npm package does not install manual pages. Users cannot open offline reference documentation with `man workforest` or use Git's familiar `git help forest` flow.

## What Changes

- Generate a section 1 manual page from Workforest's Commander command model.
- Package manual pages for the `workforest`, `git-forest`, and `git-workforest` executable names.
- Keep the checked-in manual pages synchronized with the CLI through automated tests and npm's packaging lifecycle.
- Verify the packed npm artifact installs and renders each manual-page alias.

## Capabilities

### New Capabilities

- `man-pages`: Install and maintain Unix manual pages for every shipped Workforest executable name.

### Modified Capabilities

None.

## Impact

- Adds a man-page renderer and generator script.
- Adds generated files under `man/` and tests that detect drift from the CLI model.
- Updates `package.json` package contents, lifecycle scripts, and `man` metadata.
- Does not change runtime command behavior or add runtime dependencies.

## MODIFIED Requirements

### Requirement: list command discovers nested trees
The CLI SHALL recurse into directories under the forest root to find trees whose branch name contains `/` (e.g. `feat/dark-mode` stored at `<forest-root>/feat/dark-mode`).

#### Scenario: nested tree exists
- **WHEN** the forest contains `<forest-root>/feat/dark-mode/` as a worktree
- **THEN** `git forest list` SHALL include `feat/dark-mode` in its output
- **AND** the path column SHALL show `./feat/dark-mode`

#### Scenario: skip directories
- **WHEN** scanning the forest root, directories named `node_modules`, `.git`, `.worktrees`, or `scratch` exist
- **THEN** the CLI SHALL NOT recurse into them

#### Scenario: tree with non-matching remote is excluded
- **WHEN** a subdirectory is a git repo whose `origin` remote does not match the forest marker's `remote:` URL
- **THEN** the CLI SHALL exclude it from the tree listing

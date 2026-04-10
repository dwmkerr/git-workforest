## MODIFIED Requirements

### Requirement: migrate converts existing repo to forest layout
The CLI SHALL move the existing repo into a subdirectory named after the current branch and create a `.workforest.yaml` marker containing the git remote URL read from `origin`.

#### Scenario: successful migration
- **WHEN** user confirms migration
- **THEN** the repo SHALL be moved to `<original-path>/<branch>/` and a `.workforest.yaml` marker SHALL be created at the original path containing `remote: <origin-url>`

#### Scenario: repo has no origin remote
- **WHEN** the repo being migrated has no `origin` remote configured
- **THEN** the CLI SHALL print an error asking the user to set `origin` before migrating

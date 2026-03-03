## ADDED Requirements

### Requirement: init detects context
The CLI SHALL detect whether the current directory is inside a forest, inside a git repo, or neither.

#### Scenario: inside a forest
- **WHEN** user runs `git forest init` inside a directory containing `.workforest.yaml`
- **THEN** the CLI SHALL run the status command showing current trees

#### Scenario: inside a git repo
- **WHEN** user runs `git forest init` inside a git repository that is not a forest
- **THEN** the CLI SHALL run the migrate flow (preview, confirmation, migration)

#### Scenario: outside any repo
- **WHEN** user runs `git forest init` outside any git repository
- **THEN** the CLI SHALL run the migrate flow for empty directories (prompt for org/repo to clone)

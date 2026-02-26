## ADDED Requirements

### Requirement: status command lists trees in the forest
The CLI SHALL provide a `status` command that lists all trees in the current forest. This replaces the previous `list` command.

#### Scenario: list all trees
- **WHEN** user runs `workforest status` from inside a forest
- **THEN** the CLI SHALL display each tree's name, branch, and path

#### Scenario: not inside a forest
- **WHEN** user runs `workforest status` outside a forest
- **THEN** the CLI SHALL print `error:` in red followed by "not inside a workforest."

### Requirement: status shows active branch context
When run from inside a branch folder, `status` SHALL indicate which branch the user is currently in.

#### Scenario: run from a branch folder
- **WHEN** user runs `workforest status` from inside a tree directory (e.g. `~/repos/github/dwmkerr/effective-shell/fix-typo`)
- **THEN** the output SHALL mark that tree as active (e.g. with a `*` prefix or highlight)

#### Scenario: run from the forest root
- **WHEN** user runs `workforest status` from the forest root (not inside any tree)
- **THEN** no tree SHALL be marked as active

## RENAMED Requirements

### Requirement: list command renamed to status
- **FROM:** `list`
- **TO:** `status`

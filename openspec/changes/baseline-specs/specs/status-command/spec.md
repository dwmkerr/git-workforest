## ADDED Requirements

### Requirement: status lists trees in the forest
The CLI SHALL list all git-containing subdirectories in the forest root, showing name, branch, and path.

#### Scenario: forest with multiple trees
- **WHEN** user runs `workforest status` from inside a forest with trees
- **THEN** the CLI SHALL display each tree's name, branch, and path

#### Scenario: empty forest
- **WHEN** user runs `workforest status` in a forest with no trees
- **THEN** the CLI SHALL print "no trees found."

#### Scenario: not inside a forest
- **WHEN** user runs `workforest status` outside any forest
- **THEN** the CLI SHALL print an error and exit with code 1

### Requirement: status highlights the active branch
The CLI SHALL mark the tree the user is currently inside with a `*` prefix and green highlighting.

#### Scenario: run from inside a tree
- **WHEN** user runs `workforest status` from inside a tree directory
- **THEN** that tree SHALL be marked with `*` prefix

#### Scenario: run from forest root
- **WHEN** user runs `workforest status` from the forest root (not inside any tree)
- **THEN** no tree SHALL be marked as active

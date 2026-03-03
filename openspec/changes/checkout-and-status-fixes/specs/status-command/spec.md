## MODIFIED Requirements

### Requirement: status scans for trees recursively
The CLI SHALL scan subdirectories recursively to find all git repos in the forest, not just immediate children.

#### Scenario: nested tree directory
- **WHEN** a tree exists at `feat/masterpiece/` inside the forest root
- **THEN** `statusTrees` SHALL find it with name `feat/masterpiece`, branch from git, and correct path

#### Scenario: mixed flat and nested trees
- **WHEN** the forest contains both `main/` (flat) and `feat/masterpiece/` (nested)
- **THEN** `statusTrees` SHALL return both trees

### Requirement: status shows guidance when not in a forest
The CLI SHALL print helpful info (not an error) when run outside a forest.

#### Scenario: not in a forest
- **WHEN** user runs `git forest status` outside a forest
- **THEN** the CLI SHALL print guidance text with example commands, not a red error message

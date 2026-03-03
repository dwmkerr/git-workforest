## MODIFIED Requirements

### Requirement: checkout finds nested trees
The CLI SHALL find existing trees in nested directories when checking out a branch.

#### Scenario: existing nested tree
- **WHEN** user runs `git forest checkout feat/masterpiece` and `feat/masterpiece/` exists as a tree
- **THEN** the CLI SHALL return the existing tree path without creating a new one

### Requirement: checkout shows git output
The CLI SHALL not use a spinner. Git output SHALL flow through naturally.

#### Scenario: creating a new tree
- **WHEN** user checks out a branch that doesn't exist as a tree
- **THEN** the CLI SHALL show git's native output followed by the cd hint

#### Scenario: existing tree found
- **WHEN** user checks out a branch that already exists as a tree
- **THEN** the CLI SHALL print `already checked out.` followed by the cd hint

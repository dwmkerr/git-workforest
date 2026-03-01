## ADDED Requirements

### Requirement: checkout finds or creates a tree for a branch
The CLI SHALL check if a tree already exists for the given branch. If it exists, it SHALL print a cd hint. If not, it SHALL create the tree (worktree or fat clone per config) and then print a cd hint.

#### Scenario: tree already exists
- **WHEN** user runs `git forest checkout fix-typo` and a tree for `fix-typo` already exists
- **THEN** the CLI SHALL print a cd hint to the existing tree path without creating anything

#### Scenario: tree does not exist
- **WHEN** user runs `git forest checkout fix-typo` and no tree for `fix-typo` exists
- **THEN** the CLI SHALL create a new tree for `fix-typo` and print a cd hint to the new tree path

#### Scenario: fat clone mode
- **WHEN** `fatTrees` is `true` in config and no tree exists
- **THEN** a full git clone SHALL be created instead of a worktree

### Requirement: checkout prints cd hint after completion
The CLI SHALL print a `cd` command after checkout so the user can navigate to the tree.

#### Scenario: cd hint is prominent
- **WHEN** checkout completes successfully
- **THEN** the CLI SHALL print the cd path at column 0 (not indented) using color emphasis

#### Scenario: cd hint uses relative path from cwd
- **WHEN** checkout completes successfully
- **THEN** the CLI SHALL show a relative path from the user's current working directory to the tree (e.g. `cd ../feat/config` when run from a sibling tree)

### Requirement: checkout requires forest context
The CLI SHALL only work from inside an existing forest.

#### Scenario: not inside a forest
- **WHEN** user runs `git forest checkout` outside of any forest
- **THEN** the CLI SHALL print an error and exit with code 1

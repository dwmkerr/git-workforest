## ADDED Requirements

### Requirement: checkout is an alias for add
The CLI SHALL accept `checkout` as an alias for the `add` command. Running `git forest checkout <branch>` SHALL behave identically to `git forest add <branch>`.

#### Scenario: checkout alias creates a tree
- **WHEN** user runs `git forest checkout <branch>` and no tree for `<branch>` exists
- **THEN** the CLI SHALL create the tree and print `added <branch>.` with a cd hint, identical to `git forest add <branch>`

#### Scenario: checkout alias finds existing tree
- **WHEN** user runs `git forest checkout <branch>` and a tree for `<branch>` already exists
- **THEN** the CLI SHALL print the same output as `git forest add <branch>`

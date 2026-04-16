## ADDED Requirements

### Requirement: migrate detects existing forest
When the current directory is already inside a forest, `migrate` SHALL print "already a forest" and the tree listing instead of prompting to clone or migrate.

#### Scenario: already in a forest
- **WHEN** user runs `git forest migrate` from inside an existing forest
- **THEN** the CLI SHALL print `already a forest. on branch <branch> in <org/repo>` (or `already a forest. in <org/repo>` if not inside a tree)
- **AND** SHALL print the tree listing in the same format as `git forest list`
- **AND** SHALL NOT prompt for migration or for an org/repo to clone

## MODIFIED Requirements

### Requirement: migrate detects context
The CLI SHALL detect whether the current directory is inside a forest, inside a git repo, or empty, and SHALL take the appropriate action for each context.

#### Scenario: inside a forest
- **WHEN** user runs `workforest migrate` from inside an existing forest
- **THEN** the CLI SHALL print "already a forest" with tree listing and SHALL NOT prompt to migrate or clone

#### Scenario: inside a git repo
- **WHEN** user runs `workforest migrate` inside a git repository that is not a forest
- **THEN** the CLI SHALL offer to migrate the repo into forest layout

#### Scenario: outside a git repo
- **WHEN** user runs `workforest migrate` outside any git repository
- **THEN** the CLI SHALL prompt for an `org/repo` to clone

### Requirement: migrate requires confirmation
The CLI SHALL ask for confirmation before migrating. The confirmation prompt SHALL appear after the before/after preview and SHALL default to no when the user provides empty input.

#### Scenario: user declines explicitly
- **WHEN** user responds with `n` or `no`
- **THEN** the CLI SHALL print "aborted." and exit without changes

#### Scenario: user accepts default by pressing enter
- **WHEN** user presses enter without typing anything
- **THEN** the CLI SHALL print "aborted." and exit without changes (the prompt's default is no)

#### Scenario: user confirms explicitly
- **WHEN** user responds with `y` or `yes`
- **THEN** the CLI SHALL proceed with migration

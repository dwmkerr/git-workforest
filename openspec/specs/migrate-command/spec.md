## Purpose

Migrate an existing repo to forest layout, or clone a new one interactively.

## Requirements

### Requirement: migrate detects context
The CLI SHALL detect whether the current directory is inside a git repo or not.

#### Scenario: inside a git repo
- **WHEN** user runs `workforest migrate` inside a git repository
- **THEN** the CLI SHALL offer to migrate the repo into forest layout

#### Scenario: outside a git repo
- **WHEN** user runs `workforest migrate` outside any git repository
- **THEN** the CLI SHALL prompt for an `org/repo` to clone

### Requirement: migrate converts existing repo to forest layout
The CLI SHALL move the existing repo into a subdirectory named after the current branch and create a `.workforest.yaml` marker.

#### Scenario: successful migration
- **WHEN** user confirms migration
- **THEN** the repo SHALL be moved to `<original-path>/<branch>/` and a `.workforest.yaml` marker SHALL be created at the original path

### Requirement: migrate requires confirmation
The CLI SHALL ask for confirmation before migrating.

#### Scenario: user declines
- **WHEN** user responds with anything other than "y"
- **THEN** the CLI SHALL print "aborted." and exit without changes

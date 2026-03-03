## ADDED Requirements

### Requirement: migrate shows before/after preview
The CLI SHALL show a before/after preview of the directory structure before asking for confirmation.

#### Scenario: preview shown before confirmation
- **WHEN** user runs `workforest migrate` inside a git repository
- **THEN** the CLI SHALL display a preview showing the current directory contents and the planned forest layout side by side, before the confirmation prompt

#### Scenario: preview lists top-level items
- **WHEN** the preview is displayed
- **THEN** it SHALL show the immediate children of the repo directory (not a deep recursive listing)

### Requirement: migrate shows cd hint after completion
The CLI SHALL print a `cd` command after successful migration so the user knows how to enter their tree.

#### Scenario: cd hint is prominent
- **WHEN** migration completes successfully
- **THEN** the CLI SHALL print the `cd` path at column 0 (not indented) using color emphasis

#### Scenario: cd hint uses relative path when possible
- **WHEN** the new tree is a child of the current directory
- **THEN** the CLI SHALL show `cd <branch>` (e.g., `cd main`) rather than the full absolute path

## MODIFIED Requirements

### Requirement: migrate requires confirmation
The CLI SHALL ask for confirmation before migrating. The confirmation prompt SHALL appear after the before/after preview.

#### Scenario: user declines
- **WHEN** user responds with anything other than "y"
- **THEN** the CLI SHALL print "aborted." and exit without changes

#### Scenario: user confirms after preview
- **WHEN** user responds with "y" after seeing the preview
- **THEN** the CLI SHALL proceed with migration

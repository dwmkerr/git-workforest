## ADDED Requirements

### Requirement: naked invocation shows usage examples
When the CLI is run with no command, it SHALL display practical usage examples instead of the default commander help.

#### Scenario: no arguments
- **WHEN** user runs `workforest` with no arguments
- **THEN** the CLI SHALL print usage examples showing how to clone a repo and how to migrate an existing one

#### Scenario: help flag still works
- **WHEN** user runs `workforest --help`
- **THEN** the CLI SHALL print the full commander help output with all commands listed

### Requirement: init command renamed to migrate
The `init` command SHALL be renamed to `migrate` to better describe its purpose.

#### Scenario: migrate command available
- **WHEN** user runs `workforest migrate`
- **THEN** the CLI SHALL detect the current context and offer to migrate an existing repo into forest layout

## RENAMED Requirements

### Requirement: init command renamed to migrate
- **FROM:** `init`
- **TO:** `migrate`

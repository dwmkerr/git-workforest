## Purpose

Show help with usage examples when the CLI is run with no command.

## Requirements

### Requirement: naked invocation shows help with examples
When the CLI is run with no command, it SHALL display the standard help output including practical usage examples.

#### Scenario: no arguments
- **WHEN** user runs `workforest` with no arguments
- **THEN** the CLI SHALL print help output with examples showing how to clone a repo, migrate an existing one, and check status

#### Scenario: help flag still works
- **WHEN** user runs `workforest --help`
- **THEN** the CLI SHALL print the full help output with all commands and examples listed

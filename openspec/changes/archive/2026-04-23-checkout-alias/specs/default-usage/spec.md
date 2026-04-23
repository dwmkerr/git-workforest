## MODIFIED Requirements

### Requirement: naked invocation shows help with examples
When the CLI is run with no command, it SHALL display the standard help output including practical usage examples. The command list SHALL match the currently shipped commands.

#### Scenario: no arguments
- **WHEN** user runs `workforest` (or `git forest`) with no arguments
- **THEN** the CLI SHALL print help output listing the commands `clone`, `add|checkout`, `migrate`, `init`, `list`, `remove`
- **AND** SHALL include examples for `init`, `clone`, `list`, `add`, and `remove`

#### Scenario: help flag still works
- **WHEN** user runs `workforest --help`
- **THEN** the CLI SHALL print the full help output with all commands and examples listed

#### Scenario: help text describes the project
- **WHEN** user runs `workforest --help`
- **THEN** the CLI SHALL include the description `Manage git worktrees with a simple, predictable folder structure.`

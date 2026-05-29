## ADDED Requirements

### Requirement: list command accepts `ls` as an alias

The CLI SHALL accept `git forest ls` as an alias for `git forest list`. The alias SHALL share the same action, options, and output as the primary command name, and SHALL coexist with the existing `status` alias.

#### Scenario: ls invocation lists trees

- **WHEN** user runs `git forest ls` from inside a tree
- **THEN** the CLI SHALL produce output identical to `git forest list` run from the same directory
- **AND** the exit code SHALL be the same as `git forest list`

#### Scenario: ls alias coexists with status alias

- **WHEN** user inspects the available aliases for the `list` command (e.g. via `git forest --help` or `git forest list --help`)
- **THEN** both `status` and `ls` SHALL be reported as recognised aliases of `list`

#### Scenario: ls invocation outside a forest

- **WHEN** user runs `git forest ls` from a directory that is neither a forest nor a git repo
- **THEN** the CLI SHALL print the same `not in a repo. to get started:` hint that `git forest list` prints from the same directory

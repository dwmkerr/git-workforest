## ADDED Requirements

### Requirement: ls is an alias for list
The CLI SHALL accept `ls` as an alias for the `list` command, alongside the existing `status` alias. Running `git forest ls` SHALL behave identically to `git forest list`.

#### Scenario: ls alias lists trees
- **WHEN** user runs `git forest ls` from inside a forest
- **THEN** the CLI SHALL print the same output as `git forest list`

#### Scenario: ls alias outside a forest
- **WHEN** user runs `git forest ls` from a directory that is not a forest
- **THEN** the CLI SHALL print the same contextual hint as `git forest list` (migrate suggestion or clone suggestion)

## ADDED Requirements

### Requirement: migrate surfaces git progress when falling through to clone
When `migrate` is run from a directory that is neither a forest nor a git repo, and the user supplies an `org/repo` to clone, the CLI SHALL surface git's native progress output the same way `git forest clone` does, instead of hiding it behind a static spinner.

#### Scenario: migrate prints a progress header before git runs
- **WHEN** user supplies an `org/repo` at the migrate prompt
- **THEN** the CLI SHALL print `cloning <org>/<repo>…` before invoking `git clone`

#### Scenario: migrate surfaces git output during the clone
- **WHEN** `git clone` is running as part of `git forest migrate` in the empty-context path
- **THEN** git's progress output (`Cloning into '<path>'…`, `remote: Counting objects: …`, `Receiving objects: …`, etc.) SHALL appear in the user's terminal as git produces it
- **AND** SHALL NOT be suppressed by a spinner or buffered until the child exits

#### Scenario: migrate prints the success summary after git completes
- **WHEN** the clone completes successfully
- **THEN** the CLI SHALL print `cloned to <path>` after git's own output has finished

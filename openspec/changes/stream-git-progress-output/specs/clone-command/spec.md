## ADDED Requirements

### Requirement: clone command surfaces git progress output
When the `clone` command runs `git clone`, the CLI SHALL surface git's native progress output to the user's terminal as git produces it, instead of hiding it behind a static spinner.

#### Scenario: clone prints a progress header before git runs
- **WHEN** user confirms the clone (or passes `-y`)
- **THEN** the CLI SHALL print `cloning <org>/<repo>…` before invoking `git clone`

#### Scenario: clone surfaces git output during the operation
- **WHEN** `git clone` is running as part of `git forest clone`
- **THEN** git's progress output (`Cloning into '<path>'…`, `remote: Counting objects: …`, `Receiving objects: …`, etc.) SHALL appear in the user's terminal as git produces it
- **AND** SHALL NOT be suppressed by a spinner or buffered until the child exits

#### Scenario: clone prints the success summary after git completes
- **WHEN** the clone completes successfully
- **THEN** the CLI SHALL print `cloned to <path>` after git's own output has finished

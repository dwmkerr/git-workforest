## ADDED Requirements

### Requirement: add command surfaces git progress for slow operations
When the `add` command runs an underlying long-running git operation (`git worktree add` against a large repo, or `git clone` in `fatTrees` mode), the CLI SHALL surface git's native progress output to the user's terminal as git produces it, so the operation SHALL never be silent.

#### Scenario: add prints a progress header before git runs
- **WHEN** user runs `git forest add <branch>` and a new tree must be created
- **THEN** the CLI SHALL print `adding <branch>…` before invoking the underlying git operation

#### Scenario: add surfaces git output in fatTrees mode
- **WHEN** user runs `git forest add <branch>` with `fatTrees: true`
- **THEN** git's clone progress output (`Cloning into '<path>'…`, `Receiving objects: …`, etc.) SHALL appear in the user's terminal as git produces it
- **AND** the trailing `added <branch>.` summary line SHALL still be printed once the clone succeeds

#### Scenario: add surfaces git output in worktree mode
- **WHEN** user runs `git forest add <branch>` with `fatTrees` unset or false
- **THEN** any output produced by `git worktree add` SHALL appear in the user's terminal as git produces it
- **AND** the trailing `added <branch>.` summary line SHALL still be printed once the worktree is created

#### Scenario: add prints no progress header when tree already exists
- **WHEN** user runs `git forest add <branch>` and a tree for `<branch>` already exists in the forest
- **THEN** the CLI SHALL NOT print the `adding <branch>…` header
- **AND** SHALL print the existing-tree message as today

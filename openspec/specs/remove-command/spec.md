# remove-command Specification

## Purpose

Remove a tree from the current forest. Mirrors `git worktree remove` semantics: refuses to remove the active tree (with a recovery hint), refuses dirty trees without `-f`, cleans up empty parent directories, and handles both git worktrees and fat clones. Aliased as `delete`.

## Requirements
### Requirement: remove command is also available as `delete`
The CLI SHALL accept `delete` as an alias for `remove`. Both invocations behave identically.

#### Scenario: delete alias
- **WHEN** user runs `git forest delete <branch>`
- **THEN** the CLI SHALL behave exactly as if the user had run `git forest remove <branch>`

### Requirement: remove command removes a tree from the forest
The CLI SHALL provide a `remove` command that removes a tree (worktree or fat clone) for a given branch from the current forest, mirroring `git worktree remove` semantics.

#### Scenario: remove a clean worktree
- **WHEN** user runs `git forest remove <branch>` and the tree for `<branch>` exists, is not active, and has no uncommitted changes
- **THEN** the CLI SHALL run `git worktree remove <tree-path>` against the worktree's git common dir
- **AND** SHALL print `removed <branch>.`

#### Scenario: remove a fat clone
- **WHEN** user runs `git forest remove <branch>` and the tree is a fat clone (not a linked worktree)
- **THEN** the CLI SHALL recursively delete the tree directory
- **AND** SHALL print `removed <branch>.`

#### Scenario: tree not found
- **WHEN** user runs `git forest remove <branch>` and no tree for `<branch>` exists
- **THEN** the CLI SHALL fail with `tree '<branch>' not found.`

#### Scenario: not inside a workforest
- **WHEN** user runs `git forest remove <branch>` from outside any forest
- **THEN** the CLI SHALL fail with `not inside a workforest.` followed by a hint to clone or migrate

### Requirement: remove command refuses to remove the active tree
The CLI SHALL refuse to remove the tree the user is currently inside, and SHALL print a recovery hint suggesting they `cd` to the forest root and rerun the command.

#### Scenario: attempt to remove active tree
- **WHEN** user runs `git forest remove <branch>` from inside the tree for `<branch>`
- **THEN** the CLI SHALL fail with `cannot remove the active tree.`
- **AND** SHALL print a blank line followed by `# try changing to the forest root and removing:` (dimmed) followed by `cd <forest-root>` and `git forest remove <branch>` (each on its own line, in bright white)

### Requirement: remove command refuses dirty trees without force
The CLI SHALL refuse to remove a tree with uncommitted changes (modified, untracked, or staged) unless the user passes `-f` / `--force`.

#### Scenario: dirty worktree without force
- **WHEN** user runs `git forest remove <branch>` and the worktree contains uncommitted changes
- **THEN** the CLI SHALL fail with `tree '<branch>' has uncommitted changes. use -f to force.`
- **AND** SHALL NOT delete any files

#### Scenario: dirty fat clone without force
- **WHEN** user runs `git forest remove <branch>` and the fat clone has uncommitted changes (per `git status --porcelain`)
- **THEN** the CLI SHALL fail with `tree '<branch>' has uncommitted changes. use -f to force.`

#### Scenario: dirty tree with force
- **WHEN** user runs `git forest remove -f <branch>` on a dirty tree
- **THEN** the CLI SHALL pass `--force` to `git worktree remove` (for worktrees) or recursively delete (for fat clones)
- **AND** SHALL print `removed <branch>.`

### Requirement: remove command cleans up empty parent directories
After removing a nested tree (e.g. `feat/dark-mode`), the CLI SHALL recursively remove empty parent directories between the tree path and the forest root.

#### Scenario: nested tree cleanup
- **WHEN** user removes `feat/dark-mode` and `feat/` is left empty after the removal
- **THEN** the CLI SHALL also remove `feat/`

#### Scenario: parent has siblings
- **WHEN** user removes `feat/dark-mode` and `feat/` still contains `feat/other-feature`
- **THEN** the CLI SHALL leave `feat/` in place


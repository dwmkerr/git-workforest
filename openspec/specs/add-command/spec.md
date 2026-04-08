# add-command Specification

## Purpose

Add a tree (git worktree or fat clone) for a branch within the current forest. Mirrors `git worktree add` semantics — finds an existing tree or creates a new one at the path resolved by `treeDir`, then prints a `cd` hint.

## Requirements
### Requirement: add command finds or creates a tree for a branch
The CLI SHALL provide an `add` command that finds an existing tree for a branch in the current forest, or creates a new worktree (or fat clone, if `fatTrees: true`) at the path resolved by `treeDir`. The command mirrors `git worktree add` semantics.

#### Scenario: tree already exists
- **WHEN** user runs `git forest add <branch>` and a tree for `<branch>` already exists in the forest
- **THEN** the CLI SHALL print `already exists: <branch> at <relative-path>` and a `cd` hint to that path
- **AND** SHALL NOT create a new worktree

#### Scenario: tree does not exist, branch is new
- **WHEN** user runs `git forest add <branch>` and no tree for `<branch>` exists
- **THEN** the CLI SHALL run `git worktree add <resolved-path> <branch>` against an existing tree's git directory
- **AND** SHALL print `added <branch>.` followed by a blank line and a `cd` hint pointing at the new tree

#### Scenario: user is already on the requested branch
- **WHEN** user runs `git forest add <branch>` from inside the tree for `<branch>`
- **THEN** the CLI SHALL print `already on <branch>.`
- **AND** SHALL NOT print a `cd` hint

#### Scenario: not inside a workforest, in a git repo
- **WHEN** user runs `git forest add <branch>` from inside a git repo that is not yet a forest
- **THEN** the CLI SHALL print `in repo <name>, not a forest yet. to migrate:` followed by `git forest migrate`

#### Scenario: not inside a workforest, no git repo
- **WHEN** user runs `git forest add <branch>` from a directory that is neither a forest nor a git repo
- **THEN** the CLI SHALL print `not in a repo. to get started:` followed by `git forest clone org/repo`

### Requirement: add command resolves git root from any tree
When invoked from the forest root (which is itself not a git repo), the CLI SHALL fall back to using one of the existing trees as the source git directory for the `git worktree add` operation.

#### Scenario: invoked from forest root
- **WHEN** user runs `git forest add <branch>` from the forest root and the forest contains at least one tree
- **THEN** the CLI SHALL use that tree's git directory to run `git worktree add`
- **AND** SHALL succeed

#### Scenario: invoked from forest root, no trees exist
- **WHEN** user runs `git forest add <branch>` from a forest with no trees
- **THEN** the CLI SHALL fail with `no git trees found in forest. try 'git forest clone <org/repo>' to add a repo`

### Requirement: add command supports nested branch names
The CLI SHALL handle branch names containing `/` (e.g. `feat/dark-mode`) by creating nested directories under the forest root.

#### Scenario: branch with slash
- **WHEN** user runs `git forest add feat/dark-mode`
- **THEN** the CLI SHALL create the worktree at `<forest-root>/feat/dark-mode`
- **AND** the parent `feat/` directory SHALL be created if it does not exist

### Requirement: add command checks out existing remote branches
When the requested branch does not exist locally but exists on a remote, the CLI SHALL check out the remote branch into a new tree rather than creating a new branch from `HEAD`.

#### Scenario: branch exists only on remote
- **WHEN** user runs `git forest add <branch>` and `<branch>` exists as `origin/<branch>` but not locally
- **THEN** the CLI SHALL create a worktree tracking the remote branch


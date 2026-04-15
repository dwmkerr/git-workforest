# list-command Specification

## Purpose

List all trees in the current forest with active-branch highlighting, worktree indicators, and default-branch-first sort. Mirrors `git worktree list` and `git branch -l` output conventions.

## Requirements
### Requirement: list command shows trees in the current forest
The CLI SHALL provide a `list` command that displays all trees in the current forest, mirroring `git worktree list` semantics.

#### Scenario: list trees from inside a tree
- **WHEN** user runs `git forest list` from inside a tree
- **THEN** the CLI SHALL print `on branch <branch> in <org/repo>` followed by a blank line and `trees:` followed by one line per tree

#### Scenario: list trees from forest root
- **WHEN** user runs `git forest list` from the forest root (not inside any tree)
- **THEN** the CLI SHALL print `in <org/repo>` followed by a blank line and `trees:` followed by one line per tree
- **AND** SHALL NOT mark any tree as active

#### Scenario: empty forest
- **WHEN** user runs `git forest list` in a forest with no trees
- **THEN** the CLI SHALL print `no trees found.`

#### Scenario: not inside a workforest, in a git repo
- **WHEN** user runs `git forest list` from inside a git repo that is not yet a forest
- **THEN** the CLI SHALL print `in repo <name>, not a forest yet. to migrate:` followed by `git forest migrate`

#### Scenario: not inside a workforest, no git repo
- **WHEN** user runs `git forest list` from a directory that is neither a forest nor a git repo
- **THEN** the CLI SHALL print `not in a repo. to get started:` followed by `git forest clone org/repo`

### Requirement: list command marks active and worktree branches
Each tree line SHALL be prefixed according to its role, mirroring `git branch -l`:
- `* ` (green) for the tree the user is currently inside
- `+ ` (cyan) for non-default, non-active trees (linked worktrees)
- `  ` (no colour) for the default branch when not active

#### Scenario: active tree
- **WHEN** a tree is the active tree
- **THEN** its line SHALL start with `* ` and the branch name SHALL be coloured green

#### Scenario: linked worktree
- **WHEN** a tree is not active and not the default branch
- **THEN** its line SHALL start with `+ ` and the branch name SHALL be coloured cyan

#### Scenario: default branch when not active
- **WHEN** a tree's branch is the default branch and the tree is not active
- **THEN** its line SHALL start with two spaces and the branch name SHALL not be coloured

### Requirement: list command sorts default branch first
Trees SHALL be sorted with the default branch first, then alphabetically by branch name.

#### Scenario: forest with default branch
- **WHEN** the forest contains the default branch and other branches
- **THEN** the default branch SHALL appear first in the listing
- **AND** remaining trees SHALL be sorted alphabetically by branch name

### Requirement: list command discovers nested trees
The CLI SHALL recurse into directories under the forest root to find trees whose branch name contains `/` (e.g. `feat/dark-mode` stored at `<forest-root>/feat/dark-mode`).

#### Scenario: nested tree exists
- **WHEN** the forest contains `<forest-root>/feat/dark-mode/` as a worktree
- **THEN** `git forest list` SHALL include `feat/dark-mode` in its output
- **AND** the path column SHALL show `./feat/dark-mode`

#### Scenario: skip directories
- **WHEN** scanning the forest root, directories named `node_modules`, `.git`, or `.worktrees` exist
- **THEN** the CLI SHALL NOT recurse into them

#### Scenario: tree with non-matching remote is excluded
- **WHEN** a subdirectory is a git repo whose `origin` remote does not match the forest marker's `remote:` URL
- **THEN** the CLI SHALL exclude it from the tree listing

### Requirement: list command resolves the default branch
The CLI SHALL determine the default branch via `git symbolic-ref refs/remotes/origin/HEAD`, falling back to `main` then `master` if the symbolic-ref is unset.

#### Scenario: origin/HEAD set
- **WHEN** any tree has `refs/remotes/origin/HEAD` set
- **THEN** the CLI SHALL use the branch it points to as the default branch

#### Scenario: origin/HEAD unset, main exists
- **WHEN** `refs/remotes/origin/HEAD` is unset and a `main` branch tree exists
- **THEN** the CLI SHALL treat `main` as the default branch

#### Scenario: origin/HEAD unset, only master exists
- **WHEN** `refs/remotes/origin/HEAD` is unset, no `main` exists, and a `master` branch tree exists
- **THEN** the CLI SHALL treat `master` as the default branch


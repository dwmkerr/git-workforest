# init-command Specification

## Purpose

Context-aware entry point. Detects whether the current directory is inside a forest, inside a non-forest git repo, or neither, and takes the most useful action: list trees, offer to migrate, or suggest cloning.

## Requirements
### Requirement: init command detects context and acts accordingly
The CLI SHALL provide an `init` command that detects whether the current working directory is inside a forest, inside a non-forest git repo, or neither, and SHALL take the most useful action for that context.

#### Scenario: already a forest
- **WHEN** user runs `git forest init` from inside a workforest
- **THEN** the CLI SHALL print `already a forest. on branch <branch> in <org/repo>` (or `already a forest. in <org/repo>` if not inside a tree)
- **AND** SHALL print the tree listing in the same format as `git forest list`

#### Scenario: forest with no trees
- **WHEN** user runs `git forest init` from a directory containing `.workforest.yaml` but no trees
- **THEN** the CLI SHALL print `forest detected, no trees found.`

#### Scenario: existing repo, not yet a forest
- **WHEN** user runs `git forest init` from inside a git repo that has no `.workforest.yaml` ancestor
- **THEN** the CLI SHALL print a migration preview showing the proposed forest layout with current local branches
- **AND** SHALL prompt `migrate to forest layout? (y/N)`
- **AND** on confirmation SHALL run the migration and print `migrated to forest layout.` followed by a `cd` hint
- **AND** on rejection SHALL print `aborted.`

#### Scenario: empty directory, no repo
- **WHEN** user runs `git forest init` from a directory that is neither a forest nor a git repo
- **THEN** the CLI SHALL print `no forest found. clone one with:` followed by example `git forest clone` commands

### Requirement: init command migration preview shows real branches
When `init` runs in repo context, the migration preview SHALL list the user's actual local branches, not placeholder names.

#### Scenario: repo with multiple local branches
- **WHEN** user runs `git forest init` in a repo with branches `main`, `fix-typo`, `feat/dark-mode`
- **THEN** the preview SHALL show all three branches in the proposed layout
- **AND** dimmed comment lines SHALL annotate the layout


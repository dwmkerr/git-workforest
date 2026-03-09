## Purpose

Migrate an existing repo to forest layout, or clone a new one interactively. Shows a before/after preview of the directory structure, lists real local branches, and asks for confirmation before moving files.

## CLI Output

```
$ git forest migrate

existing repo detected. migration preview:

  # before
  my-project/

  # after
  my-project/
    .workforest.yaml       # preferences
    main/                  # current branch
    <branch-1>/            # worktree
    <branch-2>/            # etc

no files will be changed, folder rename only.
migrate to forest layout? (y/N)
```

```
$ git forest migrate

existing repo detected. migration preview:

  # before
  ark/

  # after
  ark/
    .workforest.yaml       # preferences
    feat/model-providers/  # current branch
    main/                  # worktree
    fix/bug-123/           # worktree

no files will be changed, folder rename only.
migrate to forest layout? (y/N) y
migrated to forest layout.

# please change directory:
cd feat/model-providers
```

## Requirements

### Requirement: migrate detects context
The CLI SHALL detect whether the current directory is inside a git repo or not.

#### Scenario: inside a git repo
- **WHEN** user runs `workforest migrate` inside a git repository
- **THEN** the CLI SHALL offer to migrate the repo into forest layout

#### Scenario: outside a git repo
- **WHEN** user runs `workforest migrate` outside any git repository
- **THEN** the CLI SHALL prompt for an `org/repo` to clone

### Requirement: migrate converts existing repo to forest layout
The CLI SHALL move the existing repo into a subdirectory named after the current branch and create a `.workforest.yaml` marker.

#### Scenario: successful migration
- **WHEN** user confirms migration
- **THEN** the repo SHALL be moved to `<original-path>/<branch>/` and a `.workforest.yaml` marker SHALL be created at the original path

### Requirement: migrate shows before/after preview
The CLI SHALL show a before/after preview of the directory structure before asking for confirmation.

#### Scenario: preview shown before confirmation
- **WHEN** user runs `workforest migrate` inside a git repository
- **THEN** the CLI SHALL display a preview showing the current directory contents and the planned forest layout side by side, before the confirmation prompt

#### Scenario: preview lists top-level items
- **WHEN** the preview is displayed
- **THEN** it SHALL show the immediate children of the repo directory (not a deep recursive listing)

### Requirement: migrate shows cd hint after completion
The CLI SHALL print a `cd` command after successful migration so the user knows how to enter their tree.

#### Scenario: cd hint is prominent
- **WHEN** migration completes successfully
- **THEN** the CLI SHALL print the `cd` path at column 0 (not indented) using color emphasis

#### Scenario: cd hint uses relative path when possible
- **WHEN** the new tree is a child of the current directory
- **THEN** the CLI SHALL show `cd <branch>` (e.g., `cd main`) rather than the full absolute path

### Requirement: migrate requires confirmation
The CLI SHALL ask for confirmation before migrating. The confirmation prompt SHALL appear after the before/after preview.

#### Scenario: user declines
- **WHEN** user responds with anything other than "y"
- **THEN** the CLI SHALL print "aborted." and exit without changes

#### Scenario: user confirms after preview
- **WHEN** user responds with "y" after seeing the preview
- **THEN** the CLI SHALL proceed with migration

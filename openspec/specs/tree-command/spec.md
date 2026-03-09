## Purpose

Create a worktree or fat clone for a branch within an existing forest. Aliased as both `checkout` and `tree`. Finds an existing tree or creates a new one, then prints a cd hint to the branch folder.

## CLI Output

```
$ git forest checkout fix-typo
checked out fix-typo.

# please change directory:
cd fix-typo
```

```
$ git forest checkout main
already on main.
```

```
$ git forest checkout feat/new-feature
checked out feat/new-feature.

# please change directory:
cd ../feat/new-feature
```

## Requirements

### Requirement: tree creates a worktree for a branch
The CLI SHALL create a git worktree for the given branch name within the current forest.

#### Scenario: create worktree
- **WHEN** user runs `workforest tree fix-typo` from inside a forest
- **THEN** a new git worktree SHALL be created at `<forest-root>/fix-typo` on branch `fix-typo`

### Requirement: tree supports fat clones
When `fatTrees` is `true` in config, the CLI SHALL create a full clone instead of a worktree.

#### Scenario: fat clone mode
- **WHEN** `fatTrees` is `true` and user runs `workforest tree fix-typo`
- **THEN** a full git clone SHALL be created at `<forest-root>/fix-typo` with branch `fix-typo` checked out

### Requirement: tree detects forest root
The CLI SHALL find the forest root by walking up the directory tree from the current working directory.

#### Scenario: not inside a forest
- **WHEN** user runs `workforest tree` outside of any forest
- **THEN** the CLI SHALL print an error and exit with code 1

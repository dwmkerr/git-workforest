## MODIFIED CLI Output

```
$ git forest status
on branch fix/typo in my-project

trees:
  main            ./main
+ docs/readme     ./docs/readme
+ feat/dark-mode  ./feat/dark-mode
* fix/typo        ./fix/typo
```

```
$ git forest status
on branch main in my-project

trees:
* main            ./main
+ docs/readme     ./docs/readme
+ feat/dark-mode  ./feat/dark-mode
+ fix/typo        ./fix/typo
```

```
$ git forest status
in my-project

trees:
  main            ./main
+ docs/readme     ./docs/readme
+ feat/dark-mode  ./feat/dark-mode
+ fix/typo        ./fix/typo
```

## NEW Requirements

### Requirement: status uses git branch -l prefix conventions
The CLI SHALL use `*` for the active tree, `+` for worktree branches, and blank for the default branch when not active — matching `git branch -l`.

#### Scenario: active tree gets * prefix
- **WHEN** user runs `git forest status` from inside a tree
- **THEN** that tree SHALL have `*` prefix in green

#### Scenario: worktree branches get + prefix
- **WHEN** a tree is not active and not the default branch
- **THEN** it SHALL have `+` prefix in cyan

#### Scenario: default branch gets blank prefix when not active
- **WHEN** the default branch tree is not active
- **THEN** it SHALL have a blank prefix with no colour

### Requirement: status uses git branch -l colour conventions
The CLI SHALL colour branches matching `git branch -l`: green for active (`*`), cyan for worktree (`+`), no colour for default branch. Directories are bright white with `./` prefix.

### Requirement: status sorts trees with default branch first
The CLI SHALL sort trees with the default branch first, then remaining trees alphabetically by branch name.

#### Scenario: default branch detected via git symbolic-ref
- **WHEN** `git symbolic-ref refs/remotes/origin/HEAD` resolves
- **THEN** the CLI SHALL use that branch name as the default

#### Scenario: fallback to main or master
- **WHEN** `git symbolic-ref` fails
- **THEN** the CLI SHALL check for a tree with branch `main`, then `master`

#### Scenario: sort order
- **WHEN** the forest has trees `feat/a`, `main`, `docs/b`
- **THEN** status SHALL list them as `main`, `docs/b`, `feat/a`

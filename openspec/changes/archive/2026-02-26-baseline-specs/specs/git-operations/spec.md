## ADDED Requirements

### Requirement: git clone
The CLI SHALL clone a git repository to a target directory.

#### Scenario: successful clone
- **WHEN** `gitClone` is called with a valid repo URL and target path
- **THEN** the repo SHALL be cloned to the target directory

### Requirement: detect default branch
The CLI SHALL detect the default branch of a cloned repository.

#### Scenario: detect branch
- **WHEN** `getDefaultBranch` is called on a cloned repo
- **THEN** it SHALL return the name of the default branch (e.g. `main` or `master`)

### Requirement: create worktree
The CLI SHALL create a git worktree for a given branch.

#### Scenario: new worktree
- **WHEN** `gitWorktreeAdd` is called with a branch name and path
- **THEN** a new worktree SHALL be created at the given path on the given branch

### Requirement: create fat clone
The CLI SHALL create a full clone of a repo and check out a specific branch.

#### Scenario: fat clone
- **WHEN** `gitFatClone` is called with a repo path, target, and branch
- **THEN** a full clone SHALL be created at the target with the branch checked out

### Requirement: detect if inside worktree
The CLI SHALL detect whether a given directory is inside a git worktree.

#### Scenario: inside a git repo
- **WHEN** `isInsideWorktree` is called from inside a git repo
- **THEN** it SHALL return `true`

#### Scenario: outside a git repo
- **WHEN** `isInsideWorktree` is called from a non-git directory
- **THEN** it SHALL return `false`

### Requirement: get repo root
The CLI SHALL return the root directory of a git repository.

#### Scenario: inside a repo
- **WHEN** `getRepoRoot` is called from inside a git repo
- **THEN** it SHALL return the absolute path of the repo root

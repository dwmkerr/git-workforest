## ADDED Requirements

### Requirement: long-running git operations stream output to the terminal
For git invocations that are user-visible long-running operations (`gitClone`, `gitWorktreeAdd`, `gitFatClone`), the CLI SHALL inherit the child process's stdout and stderr from the parent terminal by default, allowing git's native progress output to appear live as it is produced.

#### Scenario: gitClone shows progress
- **WHEN** `gitClone` is called against a non-trivial repository
- **THEN** git's progress lines (e.g. `Cloning into '<path>'…`, `remote: Counting objects: …`, `Receiving objects: …`) SHALL be written to the user's terminal as git produces them
- **AND** they SHALL NOT be buffered until the child exits

#### Scenario: gitWorktreeAdd shows progress
- **WHEN** `gitWorktreeAdd` is called
- **THEN** any output git produces (e.g. `Preparing worktree …`, checkout messages) SHALL be written to the user's terminal as git produces it

#### Scenario: gitFatClone shows progress
- **WHEN** `gitFatClone` is called
- **THEN** git's clone progress (same output as `git clone`) followed by any checkout output SHALL be written to the user's terminal as git produces it

### Requirement: data-extracting git operations remain buffered
Git invocations whose stdout is consumed programmatically (`getDefaultBranch`, `getLocalBranch`, `isInsideWorktree`, `getRepoName`, `listLocalBranches`, `getRepoRoot`, and any other helper whose return value is derived from `stdout`) SHALL continue to buffer stdout and stderr so the calling code can parse the result.

#### Scenario: getDefaultBranch returns parsed output
- **WHEN** `getDefaultBranch` is called against a cloned repo
- **THEN** the function SHALL return the parsed branch name (e.g. `main`)
- **AND** SHALL NOT print git's output to the user's terminal

#### Scenario: listLocalBranches returns parsed output
- **WHEN** `listLocalBranches` is called
- **THEN** the function SHALL return an array of branch names
- **AND** SHALL NOT print git's output to the user's terminal

### Requirement: verbose flag is preserved as a no-op
The CLI SHALL continue to accept the `-v` / `--verbose` flag for backwards compatibility. Because long-running git operations now stream output by default, the flag SHALL have no additional effect and SHALL NOT raise an error.

#### Scenario: verbose flag is accepted
- **WHEN** user runs any command with `-v` or `--verbose`
- **THEN** the CLI SHALL accept the flag and run the command normally
- **AND** SHALL produce the same output as without the flag

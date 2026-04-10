## MODIFIED Requirements

### Requirement: add command resolves git root from any tree
When invoked from the forest root (which is itself not a git repo), the CLI SHALL use the forest marker's `remote:` URL as the authoritative origin. In fatTrees mode, `gitFatClone` SHALL receive this URL directly instead of reading `origin` from a child tree.

#### Scenario: invoked from forest root
- **WHEN** user runs `git forest add <branch>` from the forest root and the forest contains at least one tree
- **THEN** the CLI SHALL use that tree's git directory to run `git worktree add`
- **AND** SHALL succeed

#### Scenario: invoked from forest root in fatTrees mode
- **WHEN** user runs `git forest add <branch>` from the forest root with `fatTrees: true`
- **THEN** the CLI SHALL clone from the forest marker's `remote:` URL, not from a child tree's `origin`

#### Scenario: invoked from forest root, no trees exist
- **WHEN** user runs `git forest add <branch>` from a forest with no trees
- **THEN** the CLI SHALL fail with `no git trees found in forest. try 'git forest clone <org/repo>' to add a repo`

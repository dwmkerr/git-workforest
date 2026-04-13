## Purpose

Find the forest root and resolve path patterns with token expansion.

## Requirements

### Requirement: find forest root by marker file
The CLI SHALL walk up the directory tree from a starting directory looking for a `.workforest.yaml` file that contains a top-level `remote:` key with a non-empty string value. A `.workforest.yaml` file without a `remote:` key SHALL NOT be treated as a forest marker. Traversal SHALL halt at the user's home directory (`$HOME`) — neither `$HOME` nor the filesystem root SHALL ever be treated as a forest root, even if a qualifying marker file is present there.

#### Scenario: marker with remote found
- **WHEN** a `.workforest.yaml` file containing `remote: <url>` exists in an ancestor directory below `$HOME`
- **THEN** `findForestRoot` SHALL return the path of that directory

#### Scenario: marker without remote is ignored
- **WHEN** a `.workforest.yaml` file exists in an ancestor directory but does not contain a `remote:` key
- **THEN** `findForestRoot` SHALL skip it and continue walking upward

#### Scenario: traversal halts at home
- **WHEN** traversal reaches `$HOME` without finding a qualifying marker
- **THEN** `findForestRoot` SHALL return `null` without inspecting `$HOME` or any ancestor of `$HOME`


### Requirement: resolve repo path from pattern
The CLI SHALL expand token patterns (`[provider]`, `[org]`, `[repo]`) and `~` in path templates.

#### Scenario: expand tokens
- **WHEN** given pattern `~/repos/[provider]/[org]/[repo]` with tokens `{provider: "github", org: "dwmkerr", repo: "myrepo"}`
- **THEN** the resolved path SHALL be `<homedir>/repos/github/dwmkerr/myrepo`

### Requirement: resolve tree path from pattern
The CLI SHALL expand `[branch]` in tree path patterns.

#### Scenario: expand branch token
- **WHEN** given tree pattern `[branch]` with branch `fix-typo`
- **THEN** the resolved path SHALL be `<repoRoot>/fix-typo`

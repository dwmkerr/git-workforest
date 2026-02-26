## ADDED Requirements

### Requirement: find forest root by marker file
The CLI SHALL walk up the directory tree from a starting directory looking for a `.workforest.yaml` file.

#### Scenario: marker found
- **WHEN** a `.workforest.yaml` file exists in an ancestor directory
- **THEN** `findForestRoot` SHALL return the path of that directory

#### Scenario: no marker found
- **WHEN** no `.workforest.yaml` file exists in any ancestor directory up to the filesystem root
- **THEN** `findForestRoot` SHALL return `null`

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

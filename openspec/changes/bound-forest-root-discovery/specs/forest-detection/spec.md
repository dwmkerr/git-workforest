## MODIFIED Requirements

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

#### Scenario: marker at $HOME is refused
- **WHEN** a `.workforest.yaml` at `$HOME` contains a `remote:` key
- **THEN** `findForestRoot` SHALL throw an error stating that `$HOME` cannot be a forest root and instructing the user to remove `remote:` from `~/.workforest.yaml`

#### Scenario: legacy marker without remote below home
- **WHEN** a `.workforest.yaml` without `remote:` is found in a plausible forest location (not `$HOME`) and no qualifying marker exists
- **THEN** `findForestRoot` SHALL throw an error identifying the legacy file and instructing the user to add a `remote:` key

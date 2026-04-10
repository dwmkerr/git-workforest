## ADDED Requirements

### Requirement: config supports optional remote field
The config schema SHALL include an optional `remote` field of type string. The presence of this field at a file's top level distinguishes a forest-level `.workforest.yaml` (which has `remote:`) from the global config file at `~/.workforest.yaml` (which does not).

#### Scenario: global config without remote
- **WHEN** `~/.workforest.yaml` contains `reposDir`, `treeDir`, or other config fields but no `remote:`
- **THEN** the CLI SHALL load it as global config and SHALL NOT treat it as a forest marker

#### Scenario: forest-level config with remote
- **WHEN** a `.workforest.yaml` at a forest root contains `remote: <url>`
- **THEN** the CLI SHALL parse the remote URL and use it as the forest's identity

#### Scenario: invalid remote type
- **WHEN** `remote:` is present but is not a non-empty string
- **THEN** zod validation SHALL reject the file at load time

## ADDED Requirements

### Requirement: config loads from yaml file
The CLI SHALL load configuration from `~/.workforest.yaml` using yaml parsing and zod validation.

#### Scenario: valid config file
- **WHEN** `~/.workforest.yaml` exists with valid fields
- **THEN** the CLI SHALL parse and validate the config, returning typed values

#### Scenario: missing config file
- **WHEN** `~/.workforest.yaml` does not exist
- **THEN** the CLI SHALL use default values

#### Scenario: custom config path
- **WHEN** a custom config path is provided
- **THEN** the CLI SHALL load from that path instead

### Requirement: config has sensible defaults
The CLI SHALL provide defaults for all config fields.

#### Scenario: default values
- **WHEN** no config is provided
- **THEN** `reposDir` SHALL be `~/repos/[provider]/[org]/[repo]`, `treeDir` SHALL be `[branch]`, and `fatTrees` SHALL be `false`

### Requirement: config validates with zod
The CLI SHALL reject invalid config values at load time.

#### Scenario: invalid field type
- **WHEN** config contains a field with the wrong type (e.g. `fatTrees: "yes"`)
- **THEN** the CLI SHALL throw a validation error

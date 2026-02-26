## Purpose

Clone a GitHub repo into a structured forest path with interactive confirmation.

## Requirements

### Requirement: clone resolves structured path from org/repo
The CLI SHALL accept `org/repo` format and resolve it to a structured filesystem path using the configured `reposDir` pattern.

#### Scenario: valid org/repo
- **WHEN** user runs `workforest clone dwmkerr/effective-shell`
- **THEN** the CLI SHALL resolve the target path using the `reposDir` config pattern with `provider=github`, `org=dwmkerr`, `repo=effective-shell`

#### Scenario: invalid format
- **WHEN** user provides a repo argument not in `org/repo` format
- **THEN** the CLI SHALL print an error message and exit with code 1

### Requirement: clone asks for confirmation
The CLI SHALL display the proposed target path and ask for confirmation before cloning.

#### Scenario: user confirms
- **WHEN** user is shown the target path and responds with anything other than "n"
- **THEN** the CLI SHALL proceed with cloning

#### Scenario: user declines
- **WHEN** user responds with "n"
- **THEN** the CLI SHALL print "aborted." and exit without cloning

#### Scenario: skip confirmation with flag
- **WHEN** user passes `-y` or `--yes`
- **THEN** the CLI SHALL skip the confirmation prompt and clone immediately

### Requirement: clone creates forest structure
The CLI SHALL clone the repo, detect the default branch, place the clone in a subfolder named after the default branch, and write a `.workforest.yaml` marker.

#### Scenario: successful clone
- **WHEN** clone completes
- **THEN** the forest root SHALL contain a `.workforest.yaml` file and a subdirectory named after the default branch containing the cloned repo

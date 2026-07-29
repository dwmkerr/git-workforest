# man-pages Specification

## Purpose
Provide locally installed reference documentation for every Workforest executable name and Git's external-command help convention.
## Requirements
### Requirement: Package installs manual pages for all executable names
The npm package SHALL install section 1 manual pages named `workforest`, `git-forest`, and `git-workforest` on platforms that support npm manual-page installation.

#### Scenario: Open the primary manual page
- **WHEN** a user globally installs the package and runs `man workforest`
- **THEN** the system SHALL display the Workforest manual page

#### Scenario: Open a Git command alias manual page
- **WHEN** a user globally installs the package and runs `man git-forest` or `man git-workforest`
- **THEN** the system SHALL display the same Workforest manual content

#### Scenario: Open help through Git
- **WHEN** a user globally installs the package and runs `git help forest`
- **THEN** Git SHALL be able to locate the `git-forest` manual page

### Requirement: Manual page documents the shipped command interface
The Workforest manual page SHALL document the executable forms, global options, commands, command aliases, command options, examples, and related Git commands represented by the shipped CLI.

#### Scenario: Read command reference
- **WHEN** a user opens any Workforest manual-page name
- **THEN** the page SHALL contain synopsis, description, options, commands, examples, and see-also sections
- **AND** the commands and aliases SHALL match the shipped CLI command model

### Requirement: Package generation detects stale manual content
The project SHALL generate manual content deterministically from the shipped CLI command model and SHALL fail automated validation when checked-in manual content is stale.

#### Scenario: CLI command model changes without regenerating manuals
- **WHEN** commands, aliases, options, descriptions, or examples change without corresponding manual regeneration
- **THEN** the automated test suite SHALL fail

#### Scenario: npm artifact is packed
- **WHEN** the project creates an npm package artifact
- **THEN** the package lifecycle SHALL regenerate the manual pages before selecting package contents

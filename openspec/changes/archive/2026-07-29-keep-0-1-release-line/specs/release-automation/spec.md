## ADDED Requirements

### Requirement: Pre-1.0 releases remain on the 0.1.x line
The system SHALL increment only the patch component for automated releases while Workforest is configured to remain on the `0.1.x` line, regardless of whether accumulated commits contain features or breaking-change annotations.

#### Scenario: Feature commit is released
- **WHEN** the current version is `0.1.0` and unreleased commits include a `feat:` commit
- **THEN** Release Please SHALL propose version `0.1.1`

#### Scenario: Breaking commit is released
- **WHEN** the current version is `0.1.0` and unreleased commits include a breaking-change annotation
- **THEN** Release Please SHALL propose version `0.1.1`
- **AND** SHALL NOT propose version `0.2.0` or `1.0.0`

#### Scenario: Subsequent patch release
- **WHEN** the current version is `0.1.1` and another releasable commit is accumulated
- **THEN** Release Please SHALL propose version `0.1.2`
